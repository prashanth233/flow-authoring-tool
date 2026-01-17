'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge, Connection, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import FlowCanvas from '@/components/FlowCanvas';
import AIAssistant from '@/components/AIAssistant';
import Toolbar from '@/components/Toolbar';
import { FlowNodeData, FlowNode, FlowEdge, AICommand } from '@/types/flow';
import { generateNodeId, generateEdgeId } from '@/lib/utils';

const STORAGE_KEY = 'flow-authoring-tool-data';

export default function Home() {
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle node changes (drag, position updates)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<FlowNodeData>[]);
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    // Check if edge already exists
    const edgeExists = edges.some(
      (edge) => edge.source === connection.source && edge.target === connection.target
    );

    if (!edgeExists && connection.source && connection.target) {
      const newEdge: Edge = {
        id: generateEdgeId(),
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  }, [edges]);

  // Add a new node
  const handleAddNode = useCallback(() => {
    const newNode: Node<FlowNodeData> = {
      id: generateNodeId(),
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodes.length + 1}` },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length]);

  // Delete a node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Also remove all edges connected to this node
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  // Update node label
  const handleUpdateNodeLabel = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
      )
    );
  }, []);

  // Clear all nodes and edges
  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
    }
  }, []);



  // Auto-load flow on mount
  useEffect(() => {
    if (!isLoaded) {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const flowData = JSON.parse(savedData);
          if (flowData.nodes && flowData.edges) {
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
          }
        }
      } catch (error) {
        console.error('Error loading flow on mount:', error);
      }
      setIsLoaded(true);
    }
  }, [isLoaded]);

  // Auto-save flow when nodes or edges change (debounced)
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        try {
          const flowData = {
            nodes,
            edges,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(flowData));
        } catch (error) {
          console.error('Error auto-saving flow:', error);
        }
      }, 1000); // Debounce: save 1 second after last change

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, isLoaded]);

  // Handle AI commands
  const handleAICommand = useCallback((command: AICommand) => {
    switch (command.type) {
      case 'add_node': {
        const newNode: Node<FlowNodeData> = {
          id: generateNodeId(),
          type: 'custom',
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          data: { label: command.nodeLabel || `Node ${nodes.length + 1}` },
        };
        setNodes((nds) => [...nds, newNode]);
        break;
      }

      case 'delete_node': {
        if (command.nodeId) {
          handleDeleteNode(command.nodeId);
        }
        break;
      }

      case 'update_node': {
        if (command.nodeId && command.nodeLabel) {
          handleUpdateNodeLabel(command.nodeId, command.nodeLabel);
        }
        break;
      }

      case 'connect_nodes': {
        if (command.sourceNodeId && command.targetNodeId) {
          // Check if edge already exists
          const edgeExists = edges.some(
            (edge) => edge.source === command.sourceNodeId && edge.target === command.targetNodeId
          );

          if (!edgeExists) {
            const newEdge: Edge = {
              id: generateEdgeId(),
              source: command.sourceNodeId,
              target: command.targetNodeId,
              type: 'smoothstep',
            };
            setEdges((eds) => [...eds, newEdge]);
          }
        }
        break;
      }

      case 'disconnect_nodes': {
        if (command.sourceNodeId && command.targetNodeId) {
          setEdges((eds) =>
            eds.filter(
              (edge) =>
                !(edge.source === command.sourceNodeId && edge.target === command.targetNodeId)
            )
          );
        }
        break;
      }

      case 'explain':
      case 'unknown':
        // These are handled by the AI assistant UI
        break;
    }
  }, [nodes.length, edges, handleDeleteNode, handleUpdateNodeLabel]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar
        onAddNode={handleAddNode}
        onClearAll={handleClearAll}
        nodeCount={nodes.length}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDelete={handleDeleteNode}
            onNodeUpdateLabel={handleUpdateNodeLabel}
          />
        </div>
        <div className="w-96 flex-shrink-0">
          <AIAssistant nodes={nodes as FlowNode[]} onCommand={handleAICommand} />
        </div>
      </div>
    </div>
  );
}
