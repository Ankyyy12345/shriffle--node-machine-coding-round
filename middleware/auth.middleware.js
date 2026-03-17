const jwt = require('jsonwebtoken');

exports.auth = (req, res, next)=>{
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token from header:", token);
    if(!token){
        return res.status(401).json({
            message: 'token missing',
         error: "Unauthorized"
        });

    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
            error: "Unauthorized"
        });
    }
}

