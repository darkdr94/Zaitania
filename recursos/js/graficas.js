function graficar(hashtags, datos) {
    var arregloDatos = datos.split(",")
    var arregloNombres = hashtags.split(",")
    var datoSeries = []

    for (var i = 0; i < arregloDatos.length; i++) {
        var colorAleatorio = dame_color_aleatorio();
        datoSeries[i] = {
            name: arregloNombres[i],
            data: [Number(arregloDatos[i])],
            color: colorAleatorio
        }
    }
    Highcharts.chart('grafica', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Favorabilidad de personajes'
        },
        subtitle: {
            text: null
        },
        xAxis: {
            categories: ['Favorabilidad'],
            title: {
                text: null
            },
            labels: {
            rotation: -90
        }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Porcentaje (%)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ' %'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 20,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true
        },

        credits: {
            enabled: false
        },
        series: datoSeries,
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    xAxis: {
                        categories: ['Favorabilidad'],
                        title: {
                            text: null
                        }
                    },

                    yAxis: {
                        min: 0,
                        max: 100,
                        title: {
                            text: 'Porcentaje (%)',
                            align: 'high'
                        }
                    },
                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
    });

}

function dame_color_aleatorio() {
    var arregloColores = ["AFEEEE", "7FFFD4", "00FFFF", "40E0D0", "48D1CC", "00CED1", "66CDAA",
        "20B2AA", "5F9EA0", "008B8B", "008080", "B0E0E6", "ADD8E6", "87CEFA",
        "87CEEB", "B0C4DE", "00BFFF", "6495ED", "1E90FF", "4682B4", "4169E1"
    ];
    var color_aleatorio = "#";
    var posarray = aleatorio(0, arregloColores.length)
    color_aleatorio += arregloColores[posarray]
    return color_aleatorio
}

function aleatorio(inferior, superior) {
    numPosibilidades = superior - inferior
    aleat = Math.random() * numPosibilidades
    aleat = Math.floor(aleat)
    return parseInt(inferior) + aleat
}

function graficarHistorial(hashtag, fechas, favorabilidad) {
    var nombres = hashtag.split("-");
    var fecha = fechas.split("-");
    var datos = favorabilidad.split("-");
    for (var i = 0; i < nombres.length; i++) {
        var nom = nombres[i];
        var fec = fecha[i];
        var dat = datos[i];
        var nomDIV = "grafica" + (i + 1);
        graficaIndividual(nomDIV, nom, fec, dat);
    }
}

function graficaIndividual(nombreDIV, nombre, fechas, porcentajes) {
    console.log(fechas)
    var categorias = fechas.split(",");
    var datoSeries = porcentajes.split(",");
    var datoSeriesNum = [];
    var datoFechas = [];
    var datos = [];
    for (let i = 0; i < categorias.length; i++) {
        datoFechas[i] = "20" + categorias[i].replace(/:|\/|\s/gi, ",");
        let fechaTemp = datoFechas[i].split(",");
        let fechaGrafica = Date.UTC(fechaTemp[0], fechaTemp[1]-1, fechaTemp[2], fechaTemp[3], fechaTemp[4], fechaTemp[5]);
        datoSeriesNum[i] = Number(datoSeries[i]);
        datos[i] = [fechaGrafica, datoSeriesNum[i]];
    }
    console.log(JSON.stringify(datos))
    Highcharts.chart(nombreDIV, {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Registro histórico #' + nombre
        },
        subtitle: {
            text: 'Haga clic y arrastre en el área de trazado para acercar'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Favorabilidad'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            type: 'area',
            name: 'Favorabilidad',
            data: datos
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    yAxis: {
                        min: 0,
                        max: 100,
                        title: {
                            text: 'Favorabilidad'
                        }
                    },

                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
    });
}
