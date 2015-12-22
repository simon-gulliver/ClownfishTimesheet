var Crypto = {
    GetLoginHash: function (email, password) {
        return CryptoJS.SHA3(email + password);
    },

    EncryptToLocalStorage: function (name, value, password) {
        localStorage.removeItem(name); // explicit remove for iPad
        var jsonString = JSON.stringify(value);
        localStorage.setItem(name, CryptoJS.AES.encrypt(jsonString, password).toString());
        return jsonString;
    },

    DecryptFromLocalStorage: function (name, password) {
        var encText = localStorage.getItem(name);
        if (!encText || !password) return null;
        return JSON.parse(CryptoJS.AES.decrypt(encText,password).toString(CryptoJS.enc.Utf8));
    },

}



