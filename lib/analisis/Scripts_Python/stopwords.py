#!/usr/bin/env python
# -*- coding: utf-8 -*-
import nltk
import re
import redis
import pickle
from nltk.tokenize import word_tokenize

class EliminarStopWords:
	def __init__(self, hashtag, rutaScripts):
		arTweetv2 = open(hashtag + ' V2','r')
		lectTweetv2 = arTweetv2.read()
		arTweetv2.close()
		contTweetv2 = lectTweetv2.splitlines()
		redisbd = redis.StrictRedis('localhost')
		self.eliminarStopWords(hashtag, contTweetv2, redisbd, rutaScripts)
		self.initSepararFrase(hashtag)
		
	#Metodo que elimina las stopwords 			
	def eliminarStopWords(self, hashtag, contTweetv2, redisbd, rutaScripts):
		if redisbd.exists('stopwords'):
			read_stopwords = redisbd.get('stopwords')
			contStopWords = pickle.loads(read_stopwords)
		else:
			arStopWords = open(rutaScripts + 'listStopWords', 'r') 
			lectStopWords = arStopWords.read()
			contStopWords = lectStopWords.decode('utf8').split()
			arStopWords.close()
			stopWords = pickle.dumps(contStopWords)
			redisbd.set('stopwords', stopWords)
		arsTweetv3 = open(hashtag + " V3", 'w')
		for i in range(0,len(contTweetv2)):			
			lineaTweetv2 = contTweetv2[i].decode('utf8') 
			lineaTokenTweetv2 = word_tokenize(lineaTweetv2)											
			if len(lineaTokenTweetv2) != 0:
				lineaLimpiaTweet = []					
				for w in lineaTokenTweetv2:
					if w not in contStopWords:														 
						lineaLimpiaTweet.append(w)														
				lineaCompletaTweet = ''					
				for q in range(0,len(lineaLimpiaTweet)):
					lineaCompletaTweet = lineaCompletaTweet + lineaLimpiaTweet[q] + ' '
				lineaFinalTweet = lineaCompletaTweet.strip()
				arsTweetv3.write(lineaFinalTweet.encode('utf8') + "\n")								
											
	def initSepararFrase(self, hashtag):
		arTweetv3 = open(hashtag + " V3",'r')
		lectTweetv3 = arTweetv3.read()
		arTweetv3.close()
		contTweetv3 = lectTweetv3.splitlines()
		self.separarFrase(hashtag, contTweetv3)
		
	#Metodo que separa por puntos los tweets y asigna a cada FRASE un ID mas un consecutivo
	def separarFrase(self, hashtag, contTweetv3) :
		arsTweetv4 = open(hashtag + " V4", 'w')
		for i in range(0,len(contTweetv3)):
			lineaTweetv3 = contTweetv3[i].decode('utf8')
			lineaTweetv3 = re.sub(r"#","",lineaTweetv3)
			lineaTokenTweetv3 = word_tokenize(lineaTweetv3) 										
			if len(lineaTokenTweetv3) != 0:           
				numeroId = int(lineaTokenTweetv3[0])    											
				numeroId = (numeroId * 100) + 1   													
				arsTweetv4.write(str(numeroId) + ' ') 												
				tweetCompleto = ''
				for i in range(1, len(lineaTokenTweetv3)): 
					tweet = lineaTokenTweetv3[i]
					if tweet != '.':																
						tweetCompleto = tweetCompleto + tweet + ' '
					if tweet == '.' and i != len(lineaTokenTweetv3)-1:								
						tweetCompleto = tweetCompleto.strip()							
						if tweetCompleto != '':	
							arsTweetv4.write(tweetCompleto.encode('utf8') + "\n")					
							numeroId = numeroId + 1																
							arsTweetv4.write(str(numeroId) + ' ')									
							tweetCompleto = ''
				tweetFinal = tweetCompleto.strip()
				if tweetFinal != '':
					arsTweetv4.write(tweetFinal.encode('utf8') + "\n")									