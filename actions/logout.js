module.exports = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.send('error');
        }
        res.redirect('/');
    });
}
