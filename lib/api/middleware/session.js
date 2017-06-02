module.exports = function(solicitud, respuesta, next){
	if(!solicitud.session.revisor_id){
		respuesta.redirect("/loginRevisor");
	}else{
		next();
	}
}
