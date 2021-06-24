const multer = require('multer');

// var storage = multer.diskStorage({
//         destination: (req, file, cb)=>{
//             cb(null, '../frontend/src/images/storage')
//         },
//         filename: (req, file, cb) => {
//             cb(null, 'photo' + Date.now() + '--' + file.originalname)
//         }



// })

var storage = multer.memoryStorage();


var upload = multer({ storage: storage })

module.exports = upload