let navbarLogic=()=>{
    $("#collapse").on("click",()=>{
		    $("#nav-dropdown").toggleClass("slide");
    });

    $("#under-nav-container").on("click",()=>{
      $("#nav-dropdown").removeClass("slide");
    });
}
navbarLogic();

///export default navbarLogic;