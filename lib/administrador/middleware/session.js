module.exports = function(solicitud, respuesta, next){
	if(!solicitud.session.user_id){
		respuesta.redirect("/login");
	}else{
		next();
	}
}
