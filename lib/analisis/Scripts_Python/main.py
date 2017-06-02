#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re
from time import time
import nltk
import sys

import busqueda
import repetidos
import stopwords
import polaridad
import estadisticas

class Procesamiento:
	def __init__(self, consumerKey, consumerSecret, hashtag, numMax, ruta):
		global tiempo
		global tiempoDescargaF
		tiempo = time()
		numMax = int(numMax)
		rutaTemp = ruta + 'Scripts_Python/temp/'
		rutaScripts = ruta + 'Scripts_Python/'
		hashtagB = hashtag.decode("unicode_escape")
		tiempoDescargaI = time()
		objeto = busqueda.Busqueda(consumerKey, consumerSecret, hashtagB, numMax, rutaTemp)
		tiempoDescargaF = time() - tiempoDescargaI
		print objeto.hashtag
		print objeto.fecha
		print objeto.existe
		
		if objeto.error == True:
			objeto.existe = 2

		if objeto.existe == 1:
			print objeto.numDescarga
			print objeto.nombreAr
			nomArchivo = objeto.nombDescarga
			self.obtenerResultados(nomArchivo,rutaScripts)

	def	obtenerResultados(self, nomArchivo, rutaScripts):
		hashtag = nomArchivo
		repetidos.EliminarRepetidos(hashtag)
		stopwords.EliminarStopWords(hashtag,rutaScripts)
		polaridad.AsignarPolaridad(hashtag,rutaScripts)
		porcentaje = estadisticas.Estadisticas(hashtag)
		tiempoEjec = time() - tiempo
		print porcentaje.total
		print porcentaje.numAnalisis
		print tiempoEjec
		print tiempoDescargaF
		
def main():
	Procesamiento(sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],sys.argv[5])

if __name__ == '__main__':
	main()
