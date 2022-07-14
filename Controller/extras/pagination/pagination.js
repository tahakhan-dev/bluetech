module.exports.ArraySlicePagination= function(pageNumber,pageCount){
    // end will not be included in array.slice(1,10)
    var end = (pageNumber * pageCount) ;
    var start = end - pageCount;
    return {
      Start: start,
      End: end
    }
  }