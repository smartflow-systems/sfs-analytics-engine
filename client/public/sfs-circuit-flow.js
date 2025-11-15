/**
 * SFS Circuit Flow - Golden Background Animation
 * Creates a subtle, animated circuit pattern with gold traces
 */

(function() {
  'use strict';

  class CircuitFlow {
    constructor(canvasId = 'sfs-circuit') {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        console.warn('Circuit flow canvas not found');
        return;
      }

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.connections = [];
      this.nodes = [];
      this.animationId = null;
      this.isVisible = true;

      // Configuration
      this.config = {
        particleCount: 30,
        nodeCount: 20,
        maxConnections: 3,
        particleSpeed: 0.3,
        connectionDistance: 150,
        goldColor: 'rgba(255, 215, 0, 0.6)',
        goldGlow: 'rgba(255, 215, 0, 0.3)',
        nodeColor: 'rgba(255, 215, 0, 0.8)',
        particleColor: 'rgba(255, 215, 0, 1)',
      };

      this.init();
    }

    init() {
      this.resize();
      this.createNodes();
      this.createParticles();

      // Event listeners
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => this.handleVisibility());

      // Start animation
      this.animate();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createNodes() {
      this.nodes = [];
      for (let i = 0; i < this.config.nodeCount; i++) {
        this.nodes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: 2 + Math.random() * 3,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.config.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * this.config.particleSpeed,
          vy: (Math.random() - 0.5) * this.config.particleSpeed,
          radius: 1 + Math.random() * 2,
        });
      }
    }

    updateParticles() {
      this.particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
      });
    }

    updateNodes() {
      const time = Date.now() * 0.001;
      this.nodes.forEach(node => {
        node.pulse = Math.sin(time + node.x + node.y) * 0.5 + 0.5;
      });
    }

    drawConnections() {
      this.ctx.strokeStyle = this.config.goldColor;
      this.ctx.lineWidth = 0.5;

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.config.connectionDistance) {
            const opacity = 1 - distance / this.config.connectionDistance;
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.3})`;
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    drawParticles() {
      this.particles.forEach(particle => {
        // Glow effect
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 4
        );
        gradient.addColorStop(0, this.config.particleColor);
        gradient.addColorStop(0.5, this.config.goldGlow);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Core
        this.ctx.fillStyle = this.config.particleColor;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    drawNodes() {
      this.nodes.forEach(node => {
        const pulseRadius = node.radius + node.pulse * 2;

        // Glow
        const gradient = this.ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, pulseRadius * 3
        );
        gradient.addColorStop(0, this.config.nodeColor);
        gradient.addColorStop(0.5, this.config.goldGlow);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, pulseRadius * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Core
        this.ctx.fillStyle = this.config.nodeColor;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    draw() {
      // Clear canvas with fade effect
      this.ctx.fillStyle = 'rgba(20, 15, 12, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw elements
      this.drawConnections();
      this.drawNodes();
      this.drawParticles();
    }

    animate() {
      if (!this.isVisible) return;

      this.updateParticles();
      this.updateNodes();
      this.draw();

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    handleVisibility() {
      this.isVisible = !document.hidden;

      if (this.isVisible) {
        this.animate();
      } else if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('visibilitychange', this.handleVisibility);
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.SFSCircuitFlow = new CircuitFlow();
    });
  } else {
    window.SFSCircuitFlow = new CircuitFlow();
  }
})();
