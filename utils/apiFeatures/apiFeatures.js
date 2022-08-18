class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    //1) Filtering
    const queryStringObj = { ...this.queryString };

    const excludFields = ["page", "sort", "limit", "fields"];
    excludFields.forEach((field) => delete queryStringObj[field]);

    // Aplly filteration using [gte , gt , lte , lt , in]

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/(gte|gt|lte|lt|in)\b/gi, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  paginate(countDocuments) {
    //2) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit; // 2 * 10 = 20

    // Pagination results
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResults = pagination;

    return this;
  }

  sort() {
    // 3) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    // 4) faildes limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }

    return this;
  }

  search(modleName) {
    // 5) Search

    if (this.queryString.keywords) {
      const query = {};

      if (modleName === "Products") {
        query.$or = [
          //
          { title: { $regex: this.queryString.keywords, $options: "i" } },
          { description: { $regex: this.queryString.keywords, $options: "i" } },
        ];
      } else {
        query.$or = [{ name: { $regex: this.queryString.keywords, $options: "i" } }];
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
  }
}

module.exports = ApiFeatures;
