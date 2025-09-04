import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Experience from '../Experience.js';

export default class TransformControlsManager {
    constructor(camera, rendererDomElement, scene, selectableObjects = []) {
        this.camera = camera;
        this.domElement = rendererDomElement;
        this.scene = scene;
        this.selectableObjects = selectableObjects;
        this.experience = new Experience();

        // Controls
        this.controls = new TransformControls(this.camera, this.domElement);
        this.scene.add(this.controls);

        // Keep reference to OrbitControls
        this.orbitControls = null;

        // Undo stack
        this.history = [];
        this.currentAction = null;

        // Events from TransformControls
        this.controls.addEventListener('dragging-changed', (e) => {
            if (this.orbitControls) {
                this.orbitControls.enabled = !e.value;
            }
        });

        this.controls.addEventListener('mouseDown', () => {
            if (this.controls.object) {
                this.currentAction = this.saveState(this.controls.object);
            }
        });

        this.controls.addEventListener('mouseUp', () => {
            if (this.controls.object && this.currentAction) {
                this.history.push(this.currentAction);
                this.currentAction = null;
            }
        });

        // Raycaster setup
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Global listeners
        this._onClick = this.onClick.bind(this);
        this._onKeyDown = this.onKeyDown.bind(this);

        window.addEventListener('click', this._onClick);
        window.addEventListener('keydown', this._onKeyDown);
    }

    // Core methods
    setOrbitControls(orbitControls) {
        this.orbitControls = orbitControls;
    }

    setSelectableObjects(objects) {
        this.selectableObjects = objects;
    }

    attach(object) {
        this.controls.attach(object);
    }

    detach() {
        this.controls.detach();
    }

    // Undo functionality
    saveState(object) {
        return {
            object,
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone(),
        };
    }

    undo() {
        const last = this.history.pop();
        if (last && last.object) {
            last.object.position.copy(last.position);
            last.object.rotation.copy(last.rotation);
            last.object.scale.copy(last.scale);
            this.controls.attach(last.object);
        }
    }

    // Object picking
    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.selectableObjects, true);

        if (intersects.length > 0) {
            const picked = intersects.find((hit) => hit.object.isMesh);
            if (picked) {
                this.attach(picked.object);
            }
        } else {
            this.detach();
        }
    }

    // Keyboard controls
    onKeyDown(event) {
        if (event.ctrlKey && event.key.toLowerCase() === 'z') {
            this.undo();
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'g':
                this.controls.setMode('translate');
                break;
            case 'r':
                this.controls.setMode('rotate');
                break;
            case 's':
                this.controls.setMode('scale');
                break;
            case 'escape':
                this.detach();
                break;
        }
    }

    // Cleanup
    dispose() {
        window.removeEventListener('click', this._onClick);
        window.removeEventListener('keydown', this._onKeyDown);
        this.scene.remove(this.controls);
        this.controls.dispose?.();
    }
}