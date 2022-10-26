/*
 * robot.js
 * 
 * Tarea 3 GPC.
 * 
 * @autor: Joaquin Farias
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import { OBJLoader } from '../lib/OBJLoader.js'
import {OrbitControls} from '../lib/OrbitControls.module.js';
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estandar
let renderer, scene, camera, cameraControl, minicamera;
var L = 30;
var ar = window.innerWidth / window.innerHeight;

var floor;
var pelota;
var eje, eje2;
var gui, sub;
var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var spacePressed = false;
var tiro = false;

// Acciones
init();
loadScene();
startGUI();
render();

function init()
{
     // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild( renderer.domElement );

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara con orbir controls
    camera = new THREE.PerspectiveCamera( 750, ar, 0.1, 2000 );
    camera.position.set(-1300, 1000, 1200);
    camera.lookAt(1000,0,0);

    cameraControl = new OrbitControls(camera, renderer.domElement);
    cameraControl.target.set(0,0,0);
    cameraControl.noKeys = true;
    cameraControl.minDistance = 10;
    cameraControl.maxDistance = 900;

    // Camaras ortograficas
    if (ar < 1) {
        minicamera = new THREE.OrthographicCamera(-L * 10 * ar, L* 10 * ar, L* 10, -L* 10, 100, 1000);
    } else {
        minicamera = new THREE.OrthographicCamera(-L* 10, L* 10, L* 10 * ar, -L* 10 * ar, 100, 1000);
    }
    minicamera.position.set(0, 1000, 0);
    minicamera.up = new THREE.Vector3(-1,0,0);
    minicamera.lookAt(0, 0, 0);

    camera.add(minicamera);
    scene.add(minicamera)
    scene.add(camera);

    //Luces
    var luzAmbiente = new THREE.AmbientLight(0x222222);
    scene.add(luzAmbiente);

    var luzFocal1 = new THREE.SpotLight('white', 0.7);
    luzFocal1.position.set(0, 500, 500);
    luzFocal1.target.position.set(423, 7, 0);
    luzFocal1.angle = Math.PI/2;
    luzFocal1.penumbra = 0.2;
    luzFocal1.shadow.camera.near = 100;
    luzFocal1.shadow.camera.far = 1000;
    luzFocal1.shadow.camera.fov = 50;
    luzFocal1.castShadow = true;
    scene.add(luzFocal1);
    // scene.add(new THREE.CameraHelper(luzFocal1.shadow.camera));

    var luzFocal2 = new THREE.SpotLight('white', 0.7);
    luzFocal2.position.set(0, 500, -500);
    luzFocal2.target.position.set(423, 7, 0);
    luzFocal2.angle = Math.PI/2;
    luzFocal2.penumbra = 0.2;
    luzFocal2.shadow.camera.near = 100;
    luzFocal2.shadow.camera.far = 1000;
    luzFocal2.shadow.camera.fov = 50;
    luzFocal2.castShadow = true;
    scene.add(luzFocal2);
    // scene.add(new THREE.CameraHelper(luzFocal2.shadow.camera));

    var luzFocal3 = new THREE.SpotLight('white', 0.7);
    luzFocal3.position.set(500, 500, 0);
    luzFocal3.target.position.set(423, 7, 0);
    luzFocal3.angle = Math.PI/6;
    luzFocal3.penumbra = 0.2;
    luzFocal3.shadow.camera.near = 100;
    luzFocal3.shadow.camera.far = 800;
    luzFocal3.shadow.camera.fov = 50;
    luzFocal3.castShadow = true;
    scene.add(luzFocal3);
    // scene.add(new THREE.CameraHelper(luzFocal3.shadow.camera));

    var luzFocal4 = new THREE.SpotLight('white', 0.7);
    luzFocal4.position.set(-500, 500, 0);
    luzFocal4.target.position.set(423, 7, 0);
    luzFocal4.angle = Math.PI/6;
    luzFocal4.penumbra = 0.2;
    luzFocal4.shadow.camera.near = 100;
    luzFocal4.shadow.camera.far = 1000;
    luzFocal4.shadow.camera.fov = 50;
    luzFocal4.castShadow = true;
    scene.add(luzFocal4);
    // scene.add(new THREE.CameraHelper(luzFocal4.shadow.camera));

    // Eventos
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
}

function loadScene()
{
    // Cargar la escena con objetos
    // const material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});
    // const material = new THREE.MeshNormalMaterial({wireframe: true/false, flatShading: true/false});

    // texturas
    var path = "images/";
    var texCampo = new THREE.TextureLoader().load(path + "campo.jpg");
    var matCampo = new THREE.MeshLambertMaterial({color:'white', map:texCampo, side:THREE.DoubleSide, wireframe:false});
    var paredes = [path + "posx.jpg", path + "negx.jpg", path + "posy.jpg", path + "negy.jpg", path + "posz.jpg", path + "negz.jpg"];
    var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);
    var texPelota = new THREE.TextureLoader().load(path + "pelota.jpg");
    var matPelota = new THREE.MeshLambertMaterial({color:'white', map:texPelota, side:THREE.DoubleSide, wireframe:false});
    var texArco = new THREE.TextureLoader().load(path + "arco.jpg");
    var matArco = new THREE.MeshLambertMaterial({color:'white', map:texArco, side:THREE.DoubleSide, wireframe:false});
    
    // crear suelo+
    var geometry_floor = new THREE.PlaneGeometry(1280,800,100,100);
    floor = new THREE.Mesh(geometry_floor, matCampo);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    floor.castShadow = true;
    scene.add(floor);

    // crear esfera
    pelota = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), matPelota);
    pelota.position.set(423, 5, 0);
    pelota.castShadow = true;
    pelota.receiveShadow = true;
    scene.add(pelota);
    
    // crear arco de futbol
    var arco = new THREE.Object3D();
    var paloDerecho = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 80, 5), matArco);
    paloDerecho.position.set(-55, 35, 0);
    paloDerecho.castShadow = true;
    paloDerecho.receiveShadow = true;
    arco.add(paloDerecho);
    var paloIzquierdo = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 80, 5), matArco);
    paloIzquierdo.position.set(55, 35, 0);
    paloIzquierdo.castShadow = true;
    paloIzquierdo.receiveShadow = true;
    arco.add(paloIzquierdo);
    var paloSuperior = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 113, 5), matArco);
    paloSuperior.position.set(0, 73, 0);
    paloSuperior.rotation.z = Math.PI/2;
    paloSuperior.castShadow = true;
    paloSuperior.receiveShadow = true;
    arco.add(paloSuperior);
    arco.position.set(570, 7, 0);
    arco.rotateY(Math.PI/2);
    scene.add(arco);

    var arco2 = arco.clone();
    arco2.position.set(-570, 7, 0);
    scene.add(arco2);

    eje = new THREE.Object3D();
    const glloader = new GLTFLoader();
    glloader.load('models/player/man_player.glb',
    function(objeto)
    {
        eje.add(objeto.scene);
        objeto.scene.scale.set(30, 30, 30);
        objeto.scene.name = 'player';
        // stand player
        objeto.scene.position.set(0, 0, 0);
        objeto.scene.rotation.y = Math.PI/2;
        objeto.scene.traverse(ob=>{
            if(ob.isObject3D) ob.castShadow = true;
        })
    });
    scene.add(eje);
    
    eje2 = new THREE.Object3D();
    const glloader2 = new GLTFLoader();
    glloader2.load('models/player/man_player.glb',
    function(objeto)
    {
        eje2.add(objeto.scene);
        objeto.scene.scale.set(30, 30, 30);
        objeto.scene.name = 'player';
        objeto.scene.position.set(570, 0, 0);
        objeto.scene.rotation.y = -Math.PI/2;
        console.log(objeto.scene);
        objeto.scene.traverse(ob=>{
            if(ob.isObject3D) ob.castShadow = true;
        })
        var mixer = new THREE.AnimationMixer(objeto.scene);
        var relajado = mixer.clipAction(objeto.animations[13]);
        var concentrado = mixer.clipAction(objeto.animations[18]);
        var caminar1 = mixer.clipAction(objeto.animations[4]);
        var caminar2 = mixer.clipAction(objeto.animations[5]);
        var lamentase = mixer.clipAction(objeto.animations[8]);
        var celebrar = mixer.clipAction(objeto.animations[19]);
        console.log(objeto.animations);
    });
    scene.add(eje2);


    // crear material para fondo
    var paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
    var materialArray = paredes;
    var skyboxGeo = new THREE.BoxGeometry( 1300, 1000, 800 );
    var skybox = new THREE.Mesh( skyboxGeo, materialArray );
    scene.add( skybox );
}

function startGUI(){
    //Construye la interfaz de usuario
    var effectControl = {
        restart: restart_positions,
    };
    
    gui = new GUI({autoPlace: true, width: 500});

    sub = gui.addFolder("Controls");
    sub.add(effectControl, "restart").name("Restart")
}

function restart_positions(){
    eje.position.set(0, 0, 0);
    eje.rotation.set(0, 0, 0);
    pelota.position.set(423, 5, 0);
}

function update_pelota(){

    var s = 15
    if (eje.position.x + s >= pelota.position.x && pelota.position.x >= eje.position.x - s && 
        eje.position.z + s >= pelota.position.z && pelota.position.z >= eje.position.z - s) {
        // calcular angulo de rebote
        var angulo = Math.atan2(eje.position.z - pelota.position.z, eje.position.x - pelota.position.x);
        // movimiento de la pelota
        if (tiro) {
            // tween para la pelota
            var tween = new TWEEN.Tween(pelota.position)
            .to({x: pelota.position.x - 500*Math.cos(angulo), z: pelota.position.z - 500*Math.sin(angulo)}, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        } else {
            pelota.position.x -= Math.cos(angulo) * 0.5;
            pelota.position.z -= Math.sin(angulo) * 0.5;
        }
        
        console.log("Gol");
    }

    
}

function updateAspectRatio() {
    // Update camera's aspectRatio

    // Adjust canvas size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Perspective camera
    camera.aspect = ar;

    // Perspective mini camera
    var insetWidth = window.innerWidth / 4;
    var insetHeight = window.innerHeight / 4;
    minicamera.aspect = insetWidth / insetHeight;

    camera.updateProjectionMatrix();
    minicamera.updateProjectionMatrix();
}

function keyDown(event) {
    // Detect x-axis movement
    if (event.keyCode == 37 || event.keyCode == 65) {
        upPressed = true;
    }
    else if (event.keyCode == 39 || event.keyCode == 68) {
        downPressed = true;
    }
    // Detect z-axis movement
    if (event.keyCode == 38 || event.keyCode == 65) {
        leftPressed = true;
    }
    else if (event.keyCode == 40 || event.keyCode == 65) {
        rightPressed = true;
    }
    // detecto press space
    if (event.keyCode == 32) {
        spacePressed = true;
    }
}

function keyUp(event) {
    // Detect x-axis movement
    if (event.keyCode == 37 || event.keyCode == 65) {
        upPressed = false;
    }
    if (event.keyCode == 39 || event.keyCode == 68) {
        downPressed = false;
    }
    // Detect z-axis movement
    if (event.keyCode == 38 || event.keyCode == 65) {
        leftPressed = false;
    }
    if (event.keyCode == 40 || event.keyCode == 65) {
        rightPressed = false;
    }
    // detecto press space
    if (event.keyCode == 32) {
        spacePressed = false;
    }
}

function update() {
    if (leftPressed) {
        if (eje.position.x + 1 < 530) {
            eje.position.x += 1;
        }
    }
    if (rightPressed)  {
        if (eje.position.x - 1 > -530) {
            eje.position.x -= 1;
        }
    }
    if (upPressed)  {
        if (eje.position.z + 1 < 400) {
            eje.position.z += 1;
        }
    }
    if (downPressed) {
        if (eje.position.z - 1 > -400) {
            eje.position.z -= 1;
        }
    }
    if (spacePressed) {
        // animacion de gol
        if (tiro) {
            tiro = false;
        } else {
            tiro = true;
        }
    }

    TWEEN.update();

    update_pelota();

	// Control de camra
    cameraControl.update();
}

function render(){
    requestAnimationFrame (render);
    update();

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    renderer.clearDepth();

    var aspectRatio = window.innerWidth / window.innerHeight;
    var side;
    if (aspectRatio > 1) {
        side = window.innerHeight / 4;
    } else {
        side = window.innerWidth / 4;
    }
    renderer.setScissorTest(true);
    renderer.setViewport(0, window.innerHeight-side, side, side);
    renderer.setScissor(0, window.innerHeight-side, side, side);
    renderer.render(scene, minicamera);
    renderer.setScissorTest(false);
}
