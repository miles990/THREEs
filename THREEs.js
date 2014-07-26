
dbTest = new Meteor.Collection("posts");
tags = new Meteor.Collection("tags");
reference = new Meteor.Collection("reference");

if (Meteor.isClient) {
    
    Deps.autorun(function () {
       Meteor.subscribe("posts");
       Meteor.subscribe("tags");
       Meteor.subscribe("reference");
    });
    
  Template.content.helpers({
      posts : dbTest.find()
  });
    
  console.log(Template.content.posts);
    
  Template.menubar.events({
      "submit form": function(e){
          
          //prevent submit and refresh page
          e.preventDefault();
          
          //deal with tags ( Issue: In server or client? )
          //multiple tags & it matches http://www.regexper.com/#%2F%23(%5Ba-zA-Z%5D%7C%5B%5Cu4e00-%5Cu9fa5%5D)%5Cw*%2Fg
          var pattern = /#([a-zA-Z]|[\u4e00-\u9fa5])(\w|[\u4e00-\u9fa5])*/g;
          
          var msg = $(e.target).find("[name=myMsg]").val(),
              newTags = msg.match(pattern);

          
          //insert the value to mongodb
          var post = { "message" : msg };
          
          if( !!newTags ){
              post.tags = newTags;
          };
          
          post._id = dbTest.insert(post);
         
  
          //reset input value
          $(e.target).find("[name=myMsg]").val("");
          
          //clear the older posts
          $("#container").fadeIn(100,function(){
             $("#container").empty(); 
          });
          
          //render again
          setTimeout(function(){
        	init();
        	animate();
          },300);
      }
  });

  /* three */
    $(document).ready(function(){
        /* insert into table */
        /* make sure DOM is loaded read./initsh */
        
        setTimeout(function(){
        	init();
        	animate();
        },3000);
    });

    var camera, scene, renderer;
    var controls;

    var objects = [];
    var targets = { table: [], sphere: [], helix: [], grid: [] };

}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
    
  Meteor.publish("posts", function () {
  	return dbTest.find(); 
  });
  
  Meteor.publish("tags", function(){
    return tags.find();
  });
  
  Meteor.publish("reference",function(){
      return reference.find();
  });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function init() {

    table = [];
    var allPosts = dbTest.find().fetch();
   	for(var i = 0; i < allPosts.length; i++)
    {
     	table[i] = allPosts[i].message;       
    }
    
    /* before init end */
    
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // table

    for ( var i = 0; i < table.length; i ++ ) {

        var element = document.createElement( 'div' );
        element.className = 'element';
        //element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
        element.style.backgroundColor = getRandomColor();

        var symbol = document.createElement( 'div' );
        symbol.className = 'symbol';
        symbol.textContent = table[ i ];
        element.appendChild( symbol );

        var object = new THREE.CSS3DObject( element );
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add( object );

        objects.push( object );

        var object = new THREE.Object3D();
        
        //排列
        var rowCount = 8;
        var row = i%rowCount;
        object.position.x = ( (row) * 380 ) - 1330;
        var col = (i-(i%rowCount))/rowCount;
        object.position.y = - ( (col+3) * 290 ) + 990;

        targets.table.push( object );

    }

    // sphere

    var vector = new THREE.Vector3();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var phi = Math.acos( -1 + ( 2 * i ) / l );
        var theta = Math.sqrt( l * Math.PI ) * phi;

        var object = new THREE.Object3D();

        object.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
        object.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
        object.position.z = 800 * Math.cos( phi );

        vector.copy( object.position ).multiplyScalar( 2 );

        object.lookAt( vector );

        targets.sphere.push( object );

    }

    // helix

    var vector = new THREE.Vector3();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var phi = i * 0.175 + Math.PI;

        var object = new THREE.Object3D();

        object.position.x = 900 * Math.sin( phi );
        object.position.y = - ( i * 8 ) + 450;
        object.position.z = 900 * Math.cos( phi );

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        targets.helix.push( object );

    }

    // grid

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = new THREE.Object3D();

        object.position.x = ( ( i % 5 ) * 400 ) - 800;
        object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
        object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

        targets.grid.push( object );

    }

    //

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    //

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener( 'change', render );

    var button = document.getElementById( 'table' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.table, 2000 );

    }, false );

    var button = document.getElementById( 'sphere' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.sphere, 2000 );

    }, false );

    var button = document.getElementById( 'helix' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.helix, 2000 );

    }, false );

    var button = document.getElementById( 'grid' );
    button.addEventListener( 'click', function ( event ) {
		
        transform( targets.grid, 2000 );

    }, false );

    transform( targets.table, 5000 );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function transform( targets, duration ) {

    TWEEN.removeAll();

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        var target = targets[ i ];

        new TWEEN.Tween( object.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

        new TWEEN.Tween( object.rotation )
        .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

    }

    new TWEEN.Tween( this )
    .to( {}, duration * 2 )
    .onUpdate( render )
    .start();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    controls.update();

}

function render() {

    renderer.render( scene, camera );

}

