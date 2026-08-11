/**
 * GE-79 MCI Explorer — D3.js Brain Animation #10 White
 * Mint-green particles wander freely on white background
 * 
 * Features:
 * - Mint-green particles (#00cc99) on white background
 * - D3 force simulation with circle collisions
 * - Particles wander freely within card boundaries
 * - Mouse interaction pulls particles toward cursor
 * - Canvas rendering (high performance)
 * - Varied particle sizes for organic appearance
 */

const BrainAnimation = (function() {
  'use strict';

  const config = {
    width: 800,
    height: 800,
    particleCount: 450,
    particleColor: '#00cc99',
    alphaTarget: 0.3,
    velocityDecay: 0.1,
    collideIterations: 3,
    chargeStrength: 600,
    backgroundColor: '#ffffff'
  };

  let canvas = null;
  let context = null;
  let nodes = [];
  let simulation = null;

  /**
   * Generate random particles scattered in space
   */
  function generateParticles(count) {
    const particles = [];
    
    // Node 0: Central attractor (invisible, for mouse control)
    particles.push({
      id: 0,
      r: 1,
      group: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    });

    let particleIndex = 1;

    // Generate random particles
    for (let i = 1; i < count; i++) {
      // Random positions
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;

      // Varied particle sizes
      const sizeVariation = Math.random();
      let particleRadius;
      if (sizeVariation < 0.2) {
        particleRadius = 6 + Math.random() * 3;
      } else if (sizeVariation < 0.6) {
        particleRadius = 3 + Math.random() * 2.5;
      } else {
        particleRadius = 1.5 + Math.random() * 2;
      }

      particles.push({
        id: particleIndex++,
        r: particleRadius,
        group: 1,
        x: x,
        y: y,
        vx: 0,
        vy: 0
      });
    }
    
    return particles;
  }

  /**
   * Initialize canvas and simulation
   */
  function init(selector, options = {}) {
    Object.assign(config, options);

    // Create canvas
    const container = d3.select(selector);
    canvas = container.append('canvas')
      .attr('width', config.width)
      .attr('height', config.height)
      .style('display', 'block')
      .style('background', config.backgroundColor)
      .node();

    context = canvas.getContext('2d');

    // Generate particles
    nodes = generateParticles(config.particleCount);

    // Create force simulation
    simulation = d3.forceSimulation(nodes)
      .alphaTarget(config.alphaTarget)
      .velocityDecay(config.velocityDecay)
      .force('x', d3.forceX().strength(0.01))
      .force('y', d3.forceY().strength(0.01))
      .force('collide', d3.forceCollide().radius(d => d.r + 1.5).iterations(config.collideIterations))
      .force('charge', d3.forceManyBody().strength((d, i) => {
        // Central attractor pulls others inward
        if (i === 0) return -config.chargeStrength;
        return 0;
      }))
      .on('tick', ticked);

    // Mouse interaction
    d3.select(canvas)
      .on('mousemove', pointermoved)
      .on('mouseleave', () => {
        // Release attractor
        if (nodes[0]) {
          nodes[0].fx = null;
          nodes[0].fy = null;
        }
      });

    // Prevent scroll on touch
    d3.select(canvas)
      .on('touchmove', event => event.preventDefault());
  }

  /**
   * Handle mouse movement - pull attractor toward cursor (constrained within card)
   */
  function pointermoved(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (nodes[0]) {
      // Constrain the attractor to the same visible circle as the particles.
      let constrainedX = x - config.width / 2;
      let constrainedY = y - config.height / 2;
      const radius = Math.min(config.width, config.height) / 2 - 86;
      const distance = Math.hypot(constrainedX, constrainedY);
      if (distance > radius) {
        constrainedX = constrainedX / distance * radius;
        constrainedY = constrainedY / distance * radius;
      }
      
      nodes[0].fx = constrainedX;
      nodes[0].fy = constrainedY;
    }
  }

  /**
   * Render frame with particles
   */
  function ticked() {
    // Keep all particles within the visible circular field, not merely the canvas rectangle.
    const maxRadius = Math.max(...nodes.slice(1).map(d => d.r)) + 5;
    const boundaryRadius = Math.min(config.width, config.height) / 2 - maxRadius - 6;
    
    for (let i = 1; i < nodes.length; ++i) {
      const d = nodes[i];
      
      // Hard circular constraint: project escaping particles back inside the ring.
      const distance = Math.hypot(d.x, d.y);
      const allowedRadius = boundaryRadius - d.r;
      if (distance > allowedRadius) {
        d.x = d.x / distance * allowedRadius;
        d.y = d.y / distance * allowedRadius;
        d.vx *= -0.35;
        d.vy *= -0.35;
      }
    }
    
    context.clearRect(0, 0, config.width, config.height);
    context.save();
    context.translate(config.width / 2, config.height / 2);

    // Draw all particles
    for (let i = 1; i < nodes.length; ++i) {
      const d = nodes[i];
      context.beginPath();
      context.moveTo(d.x + d.r, d.y);
      context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
      
      // Mint-green color with size variation
      if (d.r > 6) {
        context.fillStyle = '#00cc99';
      } else if (d.r > 3.5) {
        context.fillStyle = '#00bb88';
      } else {
        context.fillStyle = '#00aa77';
      }
      
      context.globalAlpha = 0.9;
      context.fill();
    }

    context.restore();
    context.globalAlpha = 1.0;
  }

  /**
   * Stop simulation
   */
  function stop() {
    if (simulation) {
      simulation.stop();
    }
  }

  /**
   * Public API
   */
  return {
    init: init,
    stop: stop,
    updateConfig: (newConfig) => Object.assign(config, newConfig),
    getNodes: () => nodes,
    getConfig: () => ({ ...config })
  };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrainAnimation;
}
