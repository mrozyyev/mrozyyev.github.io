<script>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import skills from './skills.json'; // Import the updated JSON file

  let svg;
  let width;
  let height;
  let nodes = [];
  let links = [];
  let nodeMap = new Map();

  function flattenHierarchy(category, parent = null) {
    if (!category) return;

    // Create or update the node
    const node = {
      id: category.id,
      label: category.label,
      color: category.color || (parent ? parent.color : 'grey'),
      svg: category.svg || (parent ? parent.svg : '/favicon.png'),
      type: category.type || 'skill',
      parent: parent ? parent.id : null
    };
    
    if (!nodeMap.has(node.id)) {
      nodes.push(node);
      nodeMap.set(node.id, node);
    }

    if (parent && parent.id !== node.id) {
      links.push({ source: parent.id, target: node.id });
    }

    if (category.children) {
      category.children.forEach(child => flattenHierarchy(child, node));
    }
  }

  function updateDimensions() {
    width = window.innerWidth * 0.9;
    height = window.innerHeight * 0.8;

    if (svg) {
      d3.select(svg)
        .attr('width', width)
        .attr('height', height);
    }
  }

  onMount(() => {
    updateDimensions();

    // Flatten the hierarchical data
    skills.categories.forEach(category => flattenHierarchy(category));

    // Initialize positions for main nodes
    nodes.forEach((node) => {
      node.x = node.type === 'subcategory' ? Math.random() * (width - 200) + 100 : Math.random() * (width - 50) + 25;
      node.y = node.type === 'subcategory' ? Math.random() * (height - 200) + 100 : Math.random() * (height - 50) + 25;
    });

    // Define the SVG container
    const svgElement = d3.select(svg)
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collision', d3.forceCollide().radius(d => (d.radius || 20) + 5));

    // Create link elements
    const link = svgElement.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1.5);

    // Create node elements
    const node = svgElement.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Append circles or images
    node.append('circle')
      .attr('r', d => d.type === 'category' ? 40 : 20) // Make main nodes bigger
      .attr('fill', d => d.type === 'category' ? d.color : 'transparent');

    node.append('image')
      .attr('xlink:href', d => d.svg || '/favicon.png') // Fallback to a default SVG
      .attr('x', -15)
      .attr('y', -15)
      .attr('width', 30)
      .attr('height', 30);

    // Append titles below nodes
    node.append('text')
      .attr('dy', 25) // Adjust vertical position below the node
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('class', ' dark:text-neutral-100')
;

    node.append('title')
      .text(d => d.label)
      .attr('class', ' dark:text-neutral-100')
      ;

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => {
          // Keep nodes within bounds
          d.x = Math.max(20, Math.min(width - 20, d.x));
          d.y = Math.max(20, Math.min(height - 20, d.y));
          return `translate(${d.x},${d.y})`;
        });
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Handle window resize
    window.addEventListener('resize', updateDimensions);

    onDestroy(() => {
      window.removeEventListener('resize', updateDimensions);
    });
  });
</script>

<svg bind:this={svg}></svg>

<style>
  svg {
    border: 1px solid #ccc;
    display: block;
    margin: 0 auto;
  }
  .node text {
    font-size: 12px;
    /* fill: var(--label-color, #333); Use CSS variable for text color */
  }

</style>
