#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re
import redis
import pickle
from nltk.tokenize import word_tokenize

class AsignarPolaridad:
	def __init__(self, hashtag, rutaScripts):
		arTweetv4 = open(hashtag + ' V4','r')
		lectTweetv4 = arTweetv4.read()
		arTweetv4.close()
		redisbd = redis.StrictRedis('localhost')
		
		self.asignarPolaridad(hashtag, lectTweetv4, redisbd, rutaScripts)

	def asignarPolaridad(self, hashtag, lectTweetv4, redisbd, rutaScripts):
		if redisbd.exists('lexicon'):
			read_dict = redisbd.get('lexicon')
			dictLexicon = pickle.loads(read_dict)
		else:
			arLexicon = open(rutaScripts + 'lexicon','r')
			lectLexicon = arLexicon.read()
			arLexicon.close()		
			dictLexicon = {}																					  
																  
			contLexicon = lectLexicon.splitlines()		
			for i in range(0,len(contLexicon)):
				lexicon = contLexicon[i].lower()	
				lexiconSplit = lexicon.split(';')																  
				rPalLexicon = lexiconSplit[0].strip().decode('utf8')						  					  
				dictLexicon[rPalLexicon] = lexiconSplit[1].strip()
			lexicon = pickle.dumps(dictLexicon)
			redisbd.set('lexicon', lexicon)											  
		contTweetv4 = lectTweetv4.splitlines()
		arsTweetv5 = open(hashtag +' V5', 'w')

		for i in range (0,len(contTweetv4)):							
			lineaTweetv4 = contTweetv4[i].decode('utf8')	
			lineaTokenTweetv4 = word_tokenize(lineaTweetv4)
			polaridad = ''					
			arsTweetv5.write(lineaTokenTweetv4[0].encode('utf8') + " ")
			tweetCompleto = ''			
			for j in range (1, len(lineaTokenTweetv4)):
				rPalTweet = lineaTokenTweetv4[j].strip()					 
				existePalTweet = dictLexicon.has_key(rPalTweet)
				clave = dictLexicon.get(rPalTweet)  											        	 
				if existePalTweet == True:
					if clave == 'positivo':
						polaridad = '+'
					elif clave == 'negativo':
						polaridad = '-'
					elif clave == 'neutral':
						polaridad = '*'
					elif clave == 'modificador':
						polaridad = '%'
					elif clave == 'cuantificador':
						polaridad = '$'
				else:
					polaridad = lineaTokenTweetv4[j]			
				tweetCompleto = tweetCompleto + polaridad + ' '			
			patReempCuanMod = re.compile(r"((\$\s)|(\%\s)){1,}(\S+){0,1}")
			tweetReempCuanMod = patReempCuanMod.sub(self.analizarModificadores,tweetCompleto)
			arsTweetv5.write(tweetReempCuanMod.encode('utf8') + "\n")
			
	def analizarModificadores(self, caracter):
		simbolo = caracter.group().split()
		palabra = ''
		if len(simbolo) == 1:											
			if simbolo == '$': 
				return '* '
			elif simbolo == '%': 
				return '- '
		elif simbolo[len(simbolo)-1] not in ('+','-','*','%','$'):		
			if len(simbolo) == 2:										a
				if simbolo[0] == '$':
					return '* ' + simbolo[1]
				elif simbolo[0] == '%':
					return '- ' + simbolo[1]
			palabra = simbolo.pop()														
		if simbolo[len(simbolo)-1] not in ('+', '-', '*'):
			if simbolo[len(simbolo)-1] == '$':
				simbolo[len(simbolo)-1] = '*'
			elif simbolo[len(simbolo)-1] == '%':
				simbolo[len(simbolo)-1] = '-'
		
		for i in range(0, len(simbolo)-1):
			resultado = simbolo.pop().split()
			operacion = simbolo.pop()
			if operacion == '$':
				if resultado[0] == '+':
					resultado.append('+')
				if resultado[0] == '-':
					resultado.append('-')
				if resultado[0] == '*':
					resultado.append('*')
				cadena = ''
				for j in range (0, len(resultado)):
					cadena = cadena + ' ' + resultado[j]
					cadena = cadena.strip()
			elif operacion == '%':
				if resultado[0] == '+':	
					signo = '-'
				elif resultado[0] == '-':	 
					signo = '+'
				elif resultado[0] == '*':	 
					signo = '*'
				for k in range(0,len(resultado)):
					cadena = signo + ' '				
			simbolo.append(cadena)
		return simbolo[0] + ' ' + palabra