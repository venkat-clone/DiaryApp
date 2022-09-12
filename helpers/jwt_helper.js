require('firebase/auth')

const createError = require('http-errors')

const serviceAccount = require("../dairy-app-firebase.json");
var admin = require("firebase-admin");

serviceAccount.project_id = process.env.PROJECT_ID
serviceAccount.private_key_id = process.env.PRIVATE_KEY_ID
serviceAccount.private_key = process.env.PRIVATE_KEY
serviceAccount.client_email = process.env.CLIENT_EMAIL
serviceAccount.client_id = process.env.CLIENT_ID
serviceAccount.client_x509_cert_url = process.env.CLIENT_X509_CERT_URL

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


module.exports ={
    verifyAccessToken:(req,res,next)=>{

        // console.log("UID",res)

        if(!req.headers['authorization']) return next(createError.Unauthorized('Unauthorized Request'))
        const authheader = req.headers['authorization']
        const bearearToken = authheader.split(' ')
        const token = bearearToken[1]
        console.log(token)
        admin.auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            console.log("UID",uid)
            req.aud = uid
            next()
        })
        .catch((error) => {
            console.error(error)
            next(error)
        });


  
}}




