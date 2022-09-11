require('firebase/auth')

const createError = require('http-errors')

const serviceAccount = require("../dairy-app-firebase.json");
var admin = require("firebase-admin");

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
        .verifyIdToken("eyJhbGciOiJSUzI1NiIsImtpZCI6ImVkNmJjOWRhMWFmMjM2ZjhlYTU2YTVkNjIyMzQwMWZmNGUwODdmMTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZGFpcnktYXBwLWU3ZjQ2IiwiYXVkIjoiZGFpcnktYXBwLWU3ZjQ2IiwiYXV0aF90aW1lIjoxNjYyOTIwNDc3LCJ1c2VyX2lkIjoibHRRQTZ0RTVOVWFXb3h5Z0szQUUzUGxKakcyMyIsInN1YiI6Imx0UUE2dEU1TlVhV294eWdLM0FFM1BsSmpHMjMiLCJpYXQiOjE2NjI5MjA0NzgsImV4cCI6MTY2MjkyNDA3OCwiZW1haWwiOiJ2ZW5rZXkxc2luZ2xlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInZlbmtleTFzaW5nbGVAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.VNLxQkhzqIP8--8zOp84psslcrTXQBBH5c0FWzynd-SaSyqNATfeSVazW0eYU8XEEqQV-ukaj8MqdCHMXAB14pwj4MvdXdWT6lLdsIUU1c0Fr1ahjqXDX0Kwy8dAzsCv9ShMYhbnDKG4wJ5AFLvALFlxa_HJYJ0x1D2H82i5k4AgbAIPoRtNyaCdc6jCF-3iUSxixRR9MmWQSVTcpsaZsNvsj61qh_gEgJ6e-N_g3HwaFvyBzzYgr1yCdNXS1E6i0lVwuy_3thhgs6gUDEWhFhOgrzj4UDhuzU01oYBJ09rD4l9SFdaWCoUltfBGTL9i3gQqxl16oAqRyuxOzX1lIQ")
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




