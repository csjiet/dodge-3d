function setup() {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var slider1 = document.getElementById('sliderX');
    slider1.value = 0;
    var slider2 = document.getElementById('sliderY');
    slider2.value = 0;

    function draw() {
	canvas.width = canvas.width;

	// use the sliders to get the angles
    var viewAngle = slider2.value*0.02*Math.PI;

     
	function moveToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.moveTo(res[0],res[1]);}

	function lineToTx(loc,Tx)
	{var res=vec3.create(); vec3.transformMat4(res,loc,Tx); context.lineTo(res[0],res[1]);}
	
    // Create ViewPort transform
    var Tviewport = mat4.create();
	mat4.fromTranslation(Tviewport,[200,300,0]);  // Move the center of the
                                                  // "lookAt" transform (where
                                                  // the camera points) to the
                                                  // canvas coordinates (200,300)
	mat4.scale(Tviewport,Tviewport,[100,-100,1]); // Flip the Y-axis,
                                                  // scale everything by 100x

    // Create projection transform
    // (orthographic for now)
    var Tprojection = mat4.create();
    mat4.ortho(Tprojection,-10,10,-10,10,-1,1);
    // mat4.perspective(Tprojection,Math.PI/5,1,-1,1); // Use for perspective teaser!

    }
    
    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    draw();
}
window.onload = setup;


