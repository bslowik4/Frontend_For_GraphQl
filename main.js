
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene') });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 50;

const createBrick = (name, mass, position) => {
  const geometry = new THREE.BoxGeometry(10, mass / 10, 10);
  const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(position.x, position.y, position.z);
  scene.add(cube);
  
  const loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry(name, {
      font: font,
      size: 2,
      height: 0.5
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(textGeometry, textMaterial);
    mesh.position.set(position.x - 4, position.y + mass / 20, position.z);
    scene.add(mesh);
  });
};

client
  .query({
    query: gql`
      query {
        characters {
          name
          mass
        }
        planets {
          name
          diameter
        }
        starships {
          name
          cargo_capacity
        }
      }
    `,
  })
  .then((result) => {
    const { characters, planets, starships } = result.data;
    
    let position = { x: -30, y: 0, z: 0 };
    
    characters.forEach((character) => {
      const mass = parseFloat(character.mass) || 1;
      createBrick(character.name, mass, position);
      position.x += 15;
    });
    

    planets.forEach((planet) => {
      const diameter = parseFloat(planet.diameter) || 1;
      createBrick(planet.name, diameter / 10, position);
      position.x += 15;
    });
    
    starships.forEach((starship) => {
      const cargo_capacity = parseFloat(starship.cargo_capacity) || 1;
      createBrick(starship.name, cargo_capacity / 10000, position);
      position.x += 15;
    });

    const animate = function () {
      requestAnimationFrame(animate);

      scene.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
