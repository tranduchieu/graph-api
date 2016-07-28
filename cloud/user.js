import Parse from 'parse/node';

Parse.Cloud.afterSave(Parse.User, (req, res) => {
    console.log(req.object.get('authData'));
    res.success();
});
