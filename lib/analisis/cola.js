function claves() {
	var consumerKey;
	var consumerSecret;
}

function cola() {
	this.raiz = null;
	this.fondo = null;
	this.insertarPrimero = insertarClaveP;
	this.insertarUltimo = insertarClaveU;
	this.extraerPrimero = extraerClaveP;
	this.extraerUltimo = extraerClaveU;
	this.vacia = vacia;
}

function insertarClaveP(consumerKey, consumerSecret) {
	var clave = new claves();
	clave.consumerKey = consumerKey;
	clave.consumerSecret = consumerSecret;
	if (this.vacia()) {
		this.raiz = clave;
		this.fondo = clave;
	} else {
		this.raiz = clave;
		this.raiz.sig = this.fondo;
		this.fondo = this.raiz;
	}
}

function insertarClaveU(consumerKey, consumerSecret) {
	var colaTemp = new cola();
	var clave = new claves();
	clave.consumerKey = consumerKey;
	clave.consumerSecret = consumerSecret;

	if (this.vacia()) {
		this.raiz = clave;
		this.fondo = clave;
	} else {
		while (!this.vacia()) {
			var temp = new claves();
			temp = this.extraerPrimero();
			colaTemp.insertarPrimero(temp.consumerKey, temp.consumerSecret);
		}
		this.insertarPrimero(consumerKey, consumerSecret);
		while (!colaTemp.vacia()) {
			var temp = new claves();
			temp = colaTemp.extraerPrimero();
			this.insertarPrimero(temp.consumerKey, temp.consumerSecret);
		}
	}
}

function extraerClaveP() {
	var clave = this.raiz;
	if (!this.vacia()) {
		this.raiz = this.raiz.sig;
	}
	return clave;
}

function extraerClaveU() {
	var colaTemp = new cola();
	var clave = new claves();

	while (this.raiz.sig != null) {
		var temp = new claves();
		temp = this.extraerPrimero();
		colaTemp.insertarPrimero(temp.consumerKey, temp.consumerSecret);
	}
	clave = this.extraerPrimero();
	while (!colaTemp.vacia()) {
		var temp = new claves();
		temp = colaTemp.extraerPrimero();
		this.insertarPrimero(temp.consumerKey, temp.consumerSecret);
	}
	return clave;
}

function vacia() {
	if (this.raiz == null) {
		return true;
	} else {
		return false;
	}
}


var colaClaves = new cola();
exports.colaClaves = colaClaves;