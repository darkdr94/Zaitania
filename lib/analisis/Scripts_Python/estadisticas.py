#!/usr/bin/env python
# -*- coding: utf-8 -*-
import nltk
from nltk.tokenize import word_tokenize
from numpy import array, prod

class Estadisticas:
	def __init__(self, hashtag):
		arTweetP = open(hashtag + ' V5' ,'r')
		lectTweetP= arTweetP.read()
		arTweetP.close()
		self.asignarPonderacion(hashtag, lectTweetP)
							
	# Metodo que calcula el resultado total de la favorabilidad del hashtag
	def asignarPonderacion(self, hashtag, lectTweetP): 
		arsTweetP = open(hashtag + " P", 'w')									
		arSTweetPT = open(hashtag + " P T", 'w')
		contTweetP = lectTweetP.splitlines()
		listTotal = []													
		for i in range(0,len(contTweetP)):
			listGrupo = []												
			valSigno = 0
			lineaTweetP = contTweetP[i].decode('utf8')
			lineaTokenTweetP = word_tokenize(lineaTweetP)				
			for a in range(1,len(lineaTokenTweetP)):					
				if lineaTokenTweetP[a] == '+':							
					valSigno = 1
					listGrupo.append(valSigno)
				elif lineaTokenTweetP[a] == '-':
					valSigno = -1
					listGrupo.append(valSigno)
				elif lineaTokenTweetP[a] == '*':
					valSigno = 0
					listGrupo.append(valSigno)				
			longitudSigno = len(listGrupo)								
			if 	longitudSigno != 0:										
				resultado = (array(listGrupo).sum())					
				porcentaje = float(resultado)/float(longitudSigno)		
				porcentaje = (porcentaje + 1)/2							
				listTotal.append(porcentaje)							
				arsTweetP.write(lineaTokenTweetP[0] + " " + str (porcentaje) + "\n" )													
		longitudTotal = len(listTotal)
		if longitudTotal != 0:
			resultadoTotal = (array(listTotal).sum())
			porcentajeTotal = float(resultadoTotal)/float(longitudTotal)
			self.total = porcentajeTotal
			self.numAnalisis = longitudTotal
			arSTweetPT.write(str(porcentajeTotal))
		else:
			self.total = 0
			self.numAnalisis = 0
									
				
