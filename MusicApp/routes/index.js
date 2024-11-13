var express = require('express');
var router = express.Router();
// const port = process.env.PORT || 4000;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

module.exports = router;
