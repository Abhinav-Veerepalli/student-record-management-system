

export const adminHome= (req,res)=>{
     res.render('home/admin_home',{
    message:req.query.message || null
  });
}