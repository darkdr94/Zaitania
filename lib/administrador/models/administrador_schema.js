var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var administradorSchema = new Schema({
	s_name: {
		type: String,
		unique: false,
		required: true
	},
	s_tipo_usuario: {
		type: String,
		enum: ['superadmin', 'admin', 'revisor']

	},
	s_user_name: {
		type: String,
		unique: true,
		required: true
	},

	s_password: {
		type: String,
		required: true,
		minlength: [8],
		validate: {
			validator: function(psw) {

				return this.password_confirmation == psw;
			},
			message: "las contraseñas no son iguales"
		}
	}
});

administradorSchema.virtual("password_confirmation").get(function() {
	return this.password_con;
}).set(function(password) {
	this.password_con = password;
});


var Administrador = mongoose.model("administrador", administradorSchema);
exports.Administrador = Administrador;