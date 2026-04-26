//--RBAC MIDDLEWARE--//
export function RBAC(allowedROles){
    return (req,res,next)=>{
        var role=req.user.role;
        var allowed=allowedROles.find(r=>r===role);
      if(allowed){
              next();
               }
      else{
           res.status("403").send("no access");
          }
       }
}