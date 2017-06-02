#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re
import nltk
import hashlib
import time
from nltk.tokenize import word_tokenize
										 
# Clase que elimina tweets repetidos por contenido				
class EliminarRepetidos:																
	def  __init__(self, hashtag):		
		arTweet = open(hashtag,'r')																		
		lectTweet = arTweet.read()											
		arTweet.close()
		global listPalabrasSeparadas																					
		global dictPalabraSeparada																			
		listPalabrasSeparadas = []
		dictPalabraSeparada = {}
		self.eliminarCaracteres(hashtag, lectTweet) 														
		self.initSepararPalabras(hashtag)																
		self.initEliminarPorContenido(hashtag)			 												
	
	# Metodo que Quita links, menciones, emojis. Escribe ID, Tweet.
	def eliminarCaracteres(self, hashtag, lectTweet):
		arsTweet = open(hashtag + ' V1', 'w')							 	
		contTweet = lectTweet.splitlines()																
		dictIdTweet = {}                                                    							
		conTempTweet = []																					
		
		#Patron que elimina links (https://) y menciones (@nombre_user) 
		patEliminarLinkMencion = re.compile(r"(?:\@|https?\://)\S+")
		#Patron que elimina caracteres escritos en unicode: \U12345678 o \u1234																
		patEliminarUScapeU = re.compile(r"\\U +[a-zA-Z0-9]{8}|\\u +[a-zA-Z0-9]{4}", re.X)
		#Patron que reemplaza las tildes y la Ñ en codificadas en unicode_scape 
		patSustituirCaracteres = re.compile(r"(\\xe1)|(\\xe9)|(\\xed)|(\\xf3)|(\\xfa)|(\\xf1)|(\\xfc)|(\\xc1)|(\\xc9)|(\\xcd)|(\\xd3)|(\\xda)|(\\xd1)|(\\xdc)")
		#Patron que elimina caracteres en unicode_scape \x+(a-z) con longitud de 2 despues de la x
		patEliminarUScapeX = re.compile(r"\\x +[a-zA-Z0-9]{2}", re.X)				
		
		for i in range(0,len(contTweet)):				
			lineaTweet = contTweet[i].decode('utf8')													
			lineaTokenTweet = word_tokenize(lineaTweet) 												
			if len(lineaTokenTweet) != 0: 
				if lineaTokenTweet[0] != 'Fecha':				
					if lineaTokenTweet[0] == 'ID':														
						conTempTweet = ''
						arsTweet.write(lineaTokenTweet[2].encode('utf8'))      							
					else:
						if lineaTokenTweet[0] == 'Tweet':
							conTempTweet = lineaTweet.encode('unicode_escape')																															
							conTempSinLinkMencion = patEliminarLinkMencion.sub('', conTempTweet) 																			
							conTempSinUScapeU = patEliminarUScapeU.sub(' ', conTempSinLinkMencion)												
							contempCaracterEspecial = patSustituirCaracteres.sub(self.sustituirEspeciales,conTempSinUScapeU)
							conTempSinUScapeX = patEliminarUScapeX.sub(' ', contempCaracterEspecial)
							conTempTweetFinal = conTempSinUScapeX.strip()							
							arsTweet.write(' ' + conTempTweetFinal + "\n")                    			
												
	def initSepararPalabras(self, hashtag):
		arTweetv1 = open(hashtag + ' V1','r')
		lectTweetv1 = arTweetv1.read()
		arTweetv1.close()
		self.SepararPalabras(hashtag, lectTweetv1)
		
	#Metodo que separa palabras de numeros y minusculas seguidas de mayusculas 
	def SepararPalabras(self, hashtag, lectTweetv1):
		arsTweetv11 = open(hashtag + ' V1 1', 'w')
		contTweetv1 = lectTweetv1.splitlines()							
		#Patron que deja un espacio a la izquierda del #
		patSepararHashtag = re.compile(r"#")
		#Patron que identifica si hay un numero a izquierda o derecha
		patSepararNumeros = re.compile(r"(\d[^\s\d]|[^\s\d#]\d+)",re.UNICODE)		
		#Patron que separa puntos de las letras
		patSepararPuntuacion = re.compile(r"\.(\S)", re.UNICODE)
		#Patron que elimina mas de 2 puntos seguidos
		patEliminarPuntos = re.compile(r"\.{2,}|\_")
		#Patron que identifica minusculas seguidas de mayusculas dentro de los hashtag
		patSepararMinMayus = re.compile(r"#(\S+)[a-z(\xe1)(\xe9)(\xed)(\xf3)(\xfa)(\xf1)(\xfc)][A-Z(\xc1)(\xc9)(\xcd)(\xd3)(\xda)(\xd1)(\xdc)]\S+",re.UNICODE)																	
		#Patron que quita letras repetidas 3 o mas veces seguidas
		patLetrasRepetidas = re.compile(r"([a-z(\xe1)(\xe9)(\xed)(\xf3)(\xfa)(\xf1)(\xfc)(\xc1)(\xc9)(\xcd)(\xd3)(\xda)(\xd1)(\xdc)])\1+",re.IGNORECASE)		
		for i in range(0,len(contTweetv1)):			
			lineaTweetv1 = contTweetv1[i].decode('utf8') 												
			tweetSepararHashtag = patSepararHashtag.sub(' #',lineaTweetv1)			
			tweetSepararNumeros = patSepararNumeros.sub(self.separarNumeros,tweetSepararHashtag)
			tweetEliminarPuntos = patEliminarPuntos.sub(' ',tweetSepararNumeros)			
			tweetSepararPuntuacion = patSepararPuntuacion.sub(self.separarPuntuacion,tweetEliminarPuntos)
			tweetEliminarPuntuacion = re.sub(r"[^\w\s\.#]"," ",tweetSepararPuntuacion, flags = re.UNICODE)
			tweetSepararMinMayus = patSepararMinMayus.sub(self.initSepararMinMayus,tweetEliminarPuntuacion)
			tweetEliminarLetrasRepetidas = patLetrasRepetidas.sub(self.eliminarLetrasRepetidas,tweetSepararMinMayus)
			tweetFinal = tweetEliminarLetrasRepetidas.lower()
			arsTweetv11.write(tweetFinal.encode('utf8') + "\n") 										

	def initEliminarPorContenido(self, hashtag):
		arTweetv11 = open(hashtag +' V1 1','r')
		lectweetv11 = arTweetv11.read()
		arTweetv11.close()
		self.eliminarPorContenido(hashtag, lectweetv11)
		
	# Metodo que elimina tweets por cotenido repetido
	def eliminarPorContenido(self, hashtag, lectweetv11):
		contenidoT = lectweetv11.decode('utf8')
		arsTweetv2 = open(hashtag + ' V2', 'w')
		for j in range (0, len(listPalabrasSeparadas)):
			palabraCompleta =  listPalabrasSeparadas[j]
			palabra = re.sub(" ","",palabraCompleta)
			contenidoT = contenidoT.replace(palabra.lower(), palabraCompleta.lower())
		conttweetv11 = contenidoT.splitlines()															
		dictcontetweet = {}																				 				
		for i in range(0,len(conttweetv11)):			
			lineaTweetv11 = conttweetv11[i]																 
			lineaTokenTweetv11 = word_tokenize(lineaTweetv11)
			if len(lineaTokenTweetv11) != 0:
				conttweetcompleto = ''
				for a in range(2,len(lineaTokenTweetv11)):												
					conttweetcompleto = conttweetcompleto + lineaTokenTweetv11[a] + ' '
				conttweetcompleto = conttweetcompleto.encode('utf8').strip()										
				clavecontenidotweet = hashlib.new("md5", conttweetcompleto) 							
				existecontenidotweet = dictcontetweet.has_key(clavecontenidotweet.hexdigest())							
				if existecontenidotweet == False:														
					dictcontetweet[clavecontenidotweet.hexdigest()] = conttweetcompleto 				
					arsTweetv2.write(lineaTokenTweetv11[0].encode('utf8') + ' ')    					
					arsTweetv2.write(conttweetcompleto + "\n") 											
	#funcion de reemplazo de codigos de unicode a letras
	def sustituirEspeciales(self,especial):
		if especial.group() == '\\xe1':
			return 'á'
		elif especial.group() == '\\xe9':
			return 'é'
		elif especial.group() == '\\xed':
			return 'í'
		elif especial.group() == '\\xf3':
			return 'ó'
		elif especial.group() == '\\xfa':
			return 'ú'
		elif especial.group() == '\\xf1':
			return 'ñ'
		elif especial.group() == '\\xfc':
			return 'ü'
		elif especial.group() == '\\xc1':
			return 'Á'
		elif especial.group() == '\\xc9':
			return 'É'
		elif especial.group() == '\\xcd':
			return 'Í'
		elif especial.group() == '\\xd3':
			return 'Ó'
		elif especial.group() == '\\xda':
			return 'Ú'
		elif especial.group() == '\\xd1':
			return 'Ñ'
		elif especial.group() == '\\xdc':
			return 'Ü'
			
	#funcion de reemplazo de numeros pegados a letras	
	def separarNumeros(self,alpha):
		numero = alpha.group()
		if numero[1].isdigit():
			return numero.replace(numero[0], numero[0] + ' ') + ' '
		if numero[0].isdigit():
			return numero.replace(numero[0], numero[0] + ' ')
		else:
			return alpha.group()
			
	# funcion de reemplazo para separar puntuacion
	def separarPuntuacion(self, caracter):
		puntuacion = caracter.group()
		return puntuacion[0] + ' ' + puntuacion[1]
		
	# funcion de reemplazo de 3 o mas la misma letra seguida, por solo una
	def eliminarLetrasRepetidas(self,letra):		
		letras = letra.group()
		if len(letras) != 2:
			return letras[0]
		else:
			return letra.group()
			
	#funcion de reemplazo de palabras con minusculas seguidas de mayusculas
	def initSepararMinMayus(self, palabraInicial):
		palabraCompleta = palabraInicial.group()			
		#patron que identifica minusculas seguidas de mayusculas													
		patMinMayus = re.compile(r"[a-z(\xe1)(\xe9)(\xed)(\xf3)(\xfa)(\xf1)(\xfc)][A-Z(\xc1)(\xc9)(\xcd)(\xd3)(\xda)(\xd1)(\xdc)]")				
		palabra = patMinMayus.sub(self.separarMinMayus,palabraCompleta)
		palabraRetorno = re.sub('\.',' .',palabra) 														
		palabraGuardar = re.sub('(\.|#)','',palabra)													
		palabraDiccionario = palabraGuardar.lower().encode('utf8')										
		clavePalabraSeparada = hashlib.new("md5", palabraDiccionario) 							
		existePalabraSeparada = dictPalabraSeparada.has_key(clavePalabraSeparada.hexdigest())
		if existePalabraSeparada == False:
			dictPalabraSeparada[clavePalabraSeparada.hexdigest()] = palabraDiccionario
			listPalabrasSeparadas.append(palabraGuardar)
		return palabraRetorno
		
	#funcion de reemplazo de minusculas seguidas de mayusculas
	def separarMinMayus(self, letras):
		union = letras.group()
		if union[0].islower() and union[1].isupper():
			return union[0] + ' ' + union[1]		
		else:
			return letras.group()
