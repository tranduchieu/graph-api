const nodeTypes = {};
const nodeResolverMap = {};

function _wrapResolver(typeName, resolver) {
  return (...args) => {
    const resolved = resolver(...args);
    if (resolved && typeof resolved.then === 'function') {
      return resolved.then(result => {
        Object.assign(result, { __relayType: typeName });
        return result;
      });
    } else if (resolved) {
      Object.assign(resolved, { __relayType: typeName });
    }
    return resolved;
  };
}

class RelayRegistry {

  static registerNodeType(type) {
    nodeTypes[type.name.toLowerCase()] = type;
    return type;
  }

  static registerResolverForType(type, resolver) {
    const typeName = type.name.toLowerCase();
    const resolverWithRelayType = _wrapResolver(typeName, resolver);
    nodeResolverMap[typeName] = resolverWithRelayType;
    return resolverWithRelayType;
  }

  static getNodeForTypeName(typeName) {
    if (!nodeTypes[typeName.toLowerCase()]) {
      throw new Error(`RelayType "${typeName}" not defined`);
    }
    return nodeTypes[typeName.toLowerCase()];
  }

  static getResolverForNodeType(typeName) {
    if (!nodeResolverMap[typeName.toLowerCase()]) {
      throw new Error(`Resolver for RelayType "${typeName}" not defined`);
    }
    return nodeResolverMap[typeName.toLowerCase()];
  }

}

export default RelayRegistry;
