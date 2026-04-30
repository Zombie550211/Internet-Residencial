// Space Animation - Recreating the galaxy scene from the image
class SpaceAnimation {
  constructor() {
    this.canvas = document.getElementById('space-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.planets = [];
    this.asteroids = [];
    this.nebulaParticles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.time = 0;
    
    this.init();
    this.animate();
    
    // Handle mouse movement for parallax
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    
    // Handle resize
    window.addEventListener('resize', () => this.init());
  }
  
  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Create stars with different layers for parallax
    this.stars = [];
    for (let layer = 0; layer < 3; layer++) {
      const starCount = 100 + layer * 50;
      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * (2 - layer * 0.5) + 0.5,
          speed: 0.1 + layer * 0.2,
          opacity: Math.random() * 0.8 + 0.2,
          layer: layer,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    }
    
    // Create main planet (like the one in the image)
    this.planets = [
      {
        x: this.canvas.width * 0.7,
        y: this.canvas.height * 0.4,
        radius: 80,
        color: '#2a3f5f',
        glowColor: '#4a7ba7',
        rotation: 0,
        rotationSpeed: 0.001,
        cityLights: this.generateCityLights()
      },
      {
        x: this.canvas.width * 0.2,
        y: this.canvas.height * 0.3,
        radius: 30,
        color: '#8b4513',
        glowColor: '#cd853f',
        rotation: 0,
        rotationSpeed: 0.002
      }
    ];
    
    // Create asteroids/rocks in foreground
    this.asteroids = [];
    for (let i = 0; i < 5; i++) {
      this.asteroids.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height * 0.7 + Math.random() * this.canvas.height * 0.3,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
    
    // Create nebula particles
    this.nebulaParticles = [];
    for (let i = 0; i < 50; i++) {
      this.nebulaParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 100 + 50,
        color: `hsla(${Math.random() * 60 + 340}, 70%, 50%, 0.02)`,
        speed: Math.random() * 0.05 + 0.01
      });
    }
  }
  
  generateCityLights() {
    const lights = [];
    for (let i = 0; i < 20; i++) {
      lights.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 0.8 + 0.1,
        size: Math.random() * 2 + 1,
        brightness: Math.random() * 0.5 + 0.5
      });
    }
    return lights;
  }
  
  drawNebula() {
    // Create realistic nebula with multiple layers
    const nebulaX = this.canvas.width * 0.6;
    const nebulaY = this.canvas.height * 0.5;
    
    // Background nebula layer
    const bgGradient = this.ctx.createRadialGradient(
      nebulaX, nebulaY, 0,
      nebulaX, nebulaY, this.canvas.width * 0.8
    );
    bgGradient.addColorStop(0, 'rgba(139, 69, 120, 0.1)');
    bgGradient.addColorStop(0.3, 'rgba(185, 103, 145, 0.08)');
    bgGradient.addColorStop(0.6, 'rgba(220, 150, 180, 0.05)');
    bgGradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Animated nebula particles
    this.nebulaParticles.forEach(particle => {
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );
      
      // More realistic nebula colors
      const colors = [
        'rgba(139, 69, 120, 0.03)',  // Purple
        'rgba(185, 103, 145, 0.025)', // Pink
        'rgba(220, 150, 180, 0.02)',  // Light pink
        'rgba(100, 50, 140, 0.025)'   // Deep purple
      ];
      
      const colorIndex = Math.floor(particle.x / this.canvas.width * colors.length);
      gradient.addColorStop(0, colors[colorIndex].replace('0.03', '0.06'));
      gradient.addColorStop(0.5, colors[colorIndex]);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        particle.x - particle.size,
        particle.y - particle.size,
        particle.size * 2,
        particle.size * 2
      );
      
      // Slowly move nebula particles with organic movement
      particle.x += Math.sin(this.time * 0.0005 + particle.x * 0.01) * particle.speed;
      particle.y += Math.cos(this.time * 0.0007 + particle.y * 0.01) * particle.speed * 0.5;
      
      // Wrap particles around screen
      if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
      if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = this.canvas.height + particle.size;
      if (particle.y > this.canvas.height + particle.size) particle.y = -particle.size;
    });
    
    // Add some bright nebula highlights
    for (let i = 0; i < 3; i++) {
      const highlightX = nebulaX + Math.sin(this.time * 0.0003 + i * 2) * 100;
      const highlightY = nebulaY + Math.cos(this.time * 0.0004 + i * 2) * 80;
      
      const highlightGradient = this.ctx.createRadialGradient(
        highlightX, highlightY, 0,
        highlightX, highlightY, 150
      );
      highlightGradient.addColorStop(0, 'rgba(255, 200, 220, 0.08)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 150, 200, 0.04)');
      highlightGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = highlightGradient;
      this.ctx.fillRect(
        highlightX - 150,
        highlightY - 150,
        300,
        300
      );
    }
  }
  
  drawStars() {
    this.stars.forEach(star => {
      // Apply parallax based on mouse movement
      const parallaxX = this.mouseX * star.layer * 2;
      const parallaxY = this.mouseY * star.layer * 2;
      
      // Twinkle effect
      const twinkle = Math.sin(this.time * 0.001 + star.twinkle) * 0.3 + 0.7;
      
      // Vary star colors for realism
      let starColor = '255, 255, 255'; // White default
      if (Math.random() < 0.1) starColor = '255, 244, 234'; // Warm white
      if (Math.random() < 0.05) starColor = '255, 210, 161'; // Orange
      if (Math.random() < 0.03) starColor = '197, 202, 233'; // Blue white
      if (Math.random() < 0.02) starColor = '255, 204, 204'; // Red
      
      // Draw star with glow
      const gradient = this.ctx.createRadialGradient(
        star.x + parallaxX, star.y + parallaxY, 0,
        star.x + parallaxX, star.y + parallaxY, star.size * 3
      );
      gradient.addColorStop(0, `rgba(${starColor}, ${star.opacity * twinkle})`);
      gradient.addColorStop(0.3, `rgba(${starColor}, ${star.opacity * twinkle * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        star.x + parallaxX,
        star.y + parallaxY,
        star.size * 3,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Draw star core
      this.ctx.fillStyle = `rgba(${starColor}, ${star.opacity * twinkle})`;
      this.ctx.beginPath();
      this.ctx.arc(
        star.x + parallaxX,
        star.y + parallaxY,
        star.size,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Move stars slowly
      star.x -= star.speed;
      if (star.x < -10) {
        star.x = this.canvas.width + 10;
        star.y = Math.random() * this.canvas.height;
      }
    });
  }
  
  drawPlanet(planet) {
    const { x, y, radius, color, glowColor, rotation, cityLights } = planet;
    
    // Apply parallax
    const parallaxX = this.mouseX * 0.5;
    const parallaxY = this.mouseY * 0.5;
    const planetX = x + parallaxX;
    const planetY = y + parallaxY;
    
    // Draw atmospheric glow layers
    for (let i = 3; i > 0; i--) {
      const glowGradient = this.ctx.createRadialGradient(
        planetX, planetY, radius * 0.8,
        planetX, planetY, radius * (1.5 + i * 0.5)
      );
      glowGradient.addColorStop(0, glowColor + Math.floor(20 / i).toString(16));
      glowGradient.addColorStop(0.3, glowColor + Math.floor(15 / i).toString(16));
      glowGradient.addColorStop(0.7, glowColor + Math.floor(8 / i).toString(16));
      glowGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(planetX, planetY, radius * (1.5 + i * 0.5), 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Draw planet with realistic texture
    const planetGradient = this.ctx.createRadialGradient(
      planetX - radius * 0.3, planetY - radius * 0.3, 0,
      planetX, planetY, radius
    );
    
    // Create realistic planet surface colors
    if (radius > 50) {
      // Main planet - Earth-like
      planetGradient.addColorStop(0, '#4a90e2');
      planetGradient.addColorStop(0.3, '#2c5aa0');
      planetGradient.addColorStop(0.6, '#1e3a5f');
      planetGradient.addColorStop(0.8, '#0f1f2e');
      planetGradient.addColorStop(1, '#050a15');
    } else {
      // Smaller planet - Mars-like
      planetGradient.addColorStop(0, '#d4854a');
      planetGradient.addColorStop(0.4, '#b8653a');
      planetGradient.addColorStop(0.7, '#8b4513');
      planetGradient.addColorStop(1, '#5d2f0d');
    }
    
    this.ctx.fillStyle = planetGradient;
    this.ctx.beginPath();
    this.ctx.arc(planetX, planetY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add surface texture details
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const detailX = planetX + Math.cos(rotation + i * 1.2) * radius * 0.6;
      const detailY = planetY + Math.sin(rotation + i * 1.2) * radius * 0.3;
      const detailGradient = this.ctx.createRadialGradient(
        detailX, detailY, 0,
        detailX, detailY, radius * 0.3
      );
      detailGradient.addColorStop(0, radius > 50 ? '#2c5aa0' : '#8b4513');
      detailGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = detailGradient;
      this.ctx.beginPath();
      this.ctx.arc(detailX, detailY, radius * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
    
    // Draw city lights if available (for main planet)
    if (cityLights && radius > 50) {
      cityLights.forEach(light => {
        const lightX = planetX + Math.cos(light.angle + rotation) * radius * light.distance;
        const lightY = planetY + Math.sin(light.angle + rotation) * radius * light.distance * 0.5;
        
        // Check if light is on visible side of planet
        const angleFromCenter = Math.atan2(lightY - planetY, lightX - planetX);
        const visibility = Math.cos(angleFromCenter);
        
        if (visibility > 0) {
          this.ctx.save();
          this.ctx.globalAlpha = visibility * light.brightness;
          
          // Glow effect for city lights
          const lightGradient = this.ctx.createRadialGradient(
            lightX, lightY, 0,
            lightX, lightY, light.size * 3
          );
          lightGradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
          lightGradient.addColorStop(0.5, 'rgba(255, 180, 80, 0.3)');
          lightGradient.addColorStop(1, 'transparent');
          
          this.ctx.fillStyle = lightGradient;
          this.ctx.beginPath();
          this.ctx.arc(lightX, lightY, light.size * 3, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Core light
          this.ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
          this.ctx.beginPath();
          this.ctx.arc(lightX, lightY, light.size, 0, Math.PI * 2);
          this.ctx.fill();
          
          this.ctx.restore();
        }
      });
    }
    
    // Add atmospheric edge glow
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    const edgeGradient = this.ctx.createRadialGradient(
      planetX, planetY, radius * 0.9,
      planetX, planetY, radius * 1.1
    );
    edgeGradient.addColorStop(0, 'transparent');
    edgeGradient.addColorStop(0.5, glowColor + '30');
    edgeGradient.addColorStop(1, glowColor + '60');
    
    this.ctx.fillStyle = edgeGradient;
    this.ctx.beginPath();
    this.ctx.arc(planetX, planetY, radius * 1.1, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    
    // Update rotation
    planet.rotation += planet.rotationSpeed;
  }
  
  drawAsteroids() {
    this.asteroids.forEach(asteroid => {
      this.ctx.save();
      this.ctx.translate(asteroid.x, asteroid.y);
      this.ctx.rotate(asteroid.rotation);
      
      // Draw asteroid with realistic rock texture
      const vertices = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = asteroid.size * (0.7 + Math.sin(i * 1.7) * 0.3);
        vertices.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }
      
      // Create gradient for 3D effect
      const gradient = this.ctx.createRadialGradient(
        -asteroid.size * 0.3, -asteroid.size * 0.3, 0,
        0, 0, asteroid.size
      );
      gradient.addColorStop(0, 'rgba(160, 120, 80, 0.9)');
      gradient.addColorStop(0.5, 'rgba(139, 90, 43, 0.8)');
      gradient.addColorStop(1, 'rgba(101, 67, 33, 0.7)');
      
      // Draw main asteroid shape
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      vertices.forEach((vertex, i) => {
        if (i === 0) {
          this.ctx.moveTo(vertex.x, vertex.y);
        } else {
          this.ctx.lineTo(vertex.x, vertex.y);
        }
      });
      this.ctx.closePath();
      this.ctx.fill();
      
      // Add crater details
      this.ctx.fillStyle = 'rgba(80, 50, 30, 0.5)';
      for (let i = 0; i < 3; i++) {
        const craterX = (Math.random() - 0.5) * asteroid.size;
        const craterY = (Math.random() - 0.5) * asteroid.size;
        const craterSize = asteroid.size * 0.15;
        
        this.ctx.beginPath();
        this.ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Add surface texture
      this.ctx.strokeStyle = 'rgba(120, 80, 50, 0.3)';
      this.ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const startX = (Math.random() - 0.5) * asteroid.size * 1.5;
        const startY = (Math.random() - 0.5) * asteroid.size * 1.5;
        const endX = (Math.random() - 0.5) * asteroid.size * 1.5;
        const endY = (Math.random() - 0.5) * asteroid.size * 1.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
      
      // Add edge highlight for 3D effect
      this.ctx.strokeStyle = 'rgba(200, 150, 100, 0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      vertices.forEach((vertex, i) => {
        if (i === 0) {
          this.ctx.moveTo(vertex.x, vertex.y);
        } else {
          this.ctx.lineTo(vertex.x, vertex.y);
        }
      });
      this.ctx.closePath();
      this.ctx.stroke();
      
      this.ctx.restore();
      
      // Move and rotate asteroids
      asteroid.x -= asteroid.speed;
      asteroid.rotation += asteroid.rotationSpeed;
      
      if (asteroid.x < -asteroid.size * 2) {
        asteroid.x = this.canvas.width + asteroid.size * 2;
        asteroid.y = this.canvas.height * 0.7 + Math.random() * this.canvas.height * 0.3;
      }
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw space background
    this.ctx.fillStyle = 'rgba(5, 7, 18, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw all elements in order
    this.drawNebula();
    this.drawStars();
    this.planets.forEach(planet => this.drawPlanet(planet));
    this.drawAsteroids();
    
    this.time++;
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SpaceAnimation();
});
