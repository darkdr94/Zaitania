#!/usr/bin/env python
# -*- coding: utf-8 -*-
import tweepy
import sys
import jsonpickle
import hashlib
import os
import time
from datetime import datetime, date, timedelta
from nltk.tokenize import word_tokenize
reload(sys)
sys.setdefaultencoding("utf-8")

class Busqueda:
	def __init__(self, consumerKey, consumerSecret, hashtag, numMax, ruta):		
		auth = tweepy.AppAuthHandler(consumerKey,consumerSecret)
		api = tweepy.API(auth, wait_on_rate_limit=True,wait_on_rate_limit_notify=True)
		searchQuery = '#' + hashtag + ' -RT'  														
		
		formatoFecha = '%Y-%m-%d'
		fechaFin = datetime.now().utcnow() + timedelta(days = 1)
		fechaInicio  = fechaFin - timedelta(days = 15)		
		fechaInicio = fechaInicio.strftime(formatoFecha)
		fechaFin = fechaFin.strftime(formatoFecha)
		
		fecha = time.strftime("%y-%m-%d_%H-%M-%S")
		fechaMostrar = time.strftime("%y/%m/%d %H:%M:%S")
		
		self.hashtag = hashtag
		self.fecha = fechaMostrar
		self.error = False
		
		existe = self.verificarExistencia(api, searchQuery, fechaInicio, fechaFin)
		if existe:
			arDescarga = ruta + hashtag + "_" + fecha												
			self.existe = 1
			self.nombreAr = hashtag + "_" + fecha		
			self.nombDescarga = arDescarga
			self.descargarTweet(api, arDescarga, searchQuery, fechaInicio, fechaFin, numMax)
		else:
			self.existe = 0
			
	def verificarExistencia(self, api, searchQuery, fechaInicio, fechaFin):
		tweetDescarga = api.search(q=searchQuery, count = 1,lang ='es',since=fechaInicio,until=fechaFin)
		if tweetDescarga:
			return True
		else:
			return False
				
	def descargarTweet(self, api, arDescarga, searchQuery, fechaInicio, fechaFin, numMax):				
		tweetCount = 0
		maxTweets = numMax 																			
		tweetsPerQry = 100																			
		max_id = -1L 
		dictTweetid = {}												
		with open(arDescarga, 'w') as arTweet:														
			while tweetCount < maxTweets:
				try:								
					if (max_id <= 0):
						tweetDescarga = api.search(q=searchQuery, count=tweetsPerQry,lang ='es',since=fechaInicio,until=fechaFin)
					else:
						tweetDescarga = api.search(q=searchQuery, count=tweetsPerQry,lang ='es',since=fechaInicio,until=fechaFin,
													max_id=str(max_id - 1))
					if not tweetDescarga:
						break
					for tweet in tweetDescarga:
						claveId = hashlib.new("md5", tweet.id_str)									
						existeId = dictTweetid.has_key(claveId.hexdigest())							
						if existeId == False:
							dictTweetid[claveId.hexdigest()] = tweet.id_str	
							arTweet.write("ID: " + tweet.id_str + "\n")							
							tweetCompleto = ''
							tweetTemp = tweet.text
							tweetToken = tweetTemp.splitlines()
							for i in range (0,len(tweetToken)):
								tweetCompleto = tweetCompleto + tweetToken[i] + ' '								
							arTweet.write("Tweet: " + tweetCompleto.encode('utf-8') + "\n")
							arTweet.write("Fecha: %s" % tweet.created_at + "\n" + "\n")
							tweetCount += 1
					max_id = tweetDescarga[-1].id
				except tweepy.TweepError as e:
					self.error = True
					break
		self.numDescarga = tweetCount