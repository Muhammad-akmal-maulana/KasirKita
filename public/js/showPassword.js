let eyeIcon = document.getElementById("eye-icon");
let passwordLogin = document.getElementById("password");
let passwordReg = document.getElementById("reg-password");

if (eyeIcon) { eyeIcon.onclick = function () {
        //  login
        if (passwordLogin) {
            if (passwordLogin.type === "password") {
                passwordLogin.type = "text";
                eyeIcon.src = "/asset/eye-open.png";
            } else {
                passwordLogin.type = "password";
                eyeIcon.src = "/asset/eye-close.png";
            }
        }
        //  register
        if (passwordReg) {
            if (passwordReg.type === "password") {
                passwordReg.type = "text";
                eyeIcon.src = "/asset/eye-open.png";
            } else {
                passwordReg.type = "password";
                eyeIcon.src = "/asset/eye-close.png";
            }
        }
    }
}