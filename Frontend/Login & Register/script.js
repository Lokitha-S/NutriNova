function checkPassword(){
    let password=document.getElementById
    ("password").value;
    let cnfrmPassword=document.getElementById
    ("cnfrm-password").value;
    console.log(password,cnfrmPassword);
    let message=document.getElementById
    {"message"};

    if(password.length !=0){
        if(password==cnfrmPassword){
            message.textContent="Passwords Match"
            message.style.backgroundColor="#fff"
        }
        else{
            message.textContent="Password Doesn't Match"
            message.style.backgroundColor="#fff"
        }
    }
}