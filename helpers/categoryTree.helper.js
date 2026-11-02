const generateCategoryTree = (categories, parentId = "") => {
  const tree = [];
  categories.forEach(item => {
    if(item.parent == parentId){
      const childrenList = generateCategoryTree(categories,item.id);
      const data = {
        id : item.id,
        name : item.name,
        children : childrenList
      }
      tree.push(data);
    }
  });
  return tree;
}

module.exports.categoryTree = generateCategoryTree;