import { Node, Edge } from '@xyflow/react';

export interface FlowNodeData {
  label: string;
  onDelete?: (nodeId: string) => void;
  onUpdateLabel?: (nodeId: string, label: string) => void;
  [key: string]: unknown;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface AICommand {
  type: 'add_node' | 'delete_node' | 'update_node' | 'connect_nodes' | 'disconnect_nodes' | 'explain' | 'unknown';
  nodeId?: string;
  nodeLabel?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  edgeId?: string;
  message?: string;
}
