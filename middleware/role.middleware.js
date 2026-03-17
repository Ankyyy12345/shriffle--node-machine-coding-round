exports.adminAuth = (req, res, next) => {
    if(req.user.role !== 'ADMIN'){
        return res.status(403).json({
            message: 'Access denied',
            error: "Forbidden"
        });
    }
    next();
}