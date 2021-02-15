class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	//REMOVES FUNCTION PARAMETERS FROM THE QUERY, PUT ANY PARAMS YOU'LL USE ON FUNCTIONS HERE
	filter() {
		const newQuery = {...this.queryString};
		['page', 'sort', 'limit', 'fields', 'search'].forEach(el => {
			delete newQuery[el];
		});
		this.query = this.query.find(newQuery);
		return this;
	}

	search() {
		if (this.queryString.search)
			this.query = this.query.find({
				name: {$regex: this.queryString.search, $options: 'ig'},
			});
		return this;
	}

	sort() {
		if (this.queryString.sort)
			this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
		else this.query = this.query.sort('-createdAt');

		return this;
	}

	limitFields() {
		if (this.queryString.fields)
			this.query = this.query.select(
				this.queryString.fields.split(',').join(' ')
			);
		else this.query = this.query.select('-__v');
		return this;
	}

	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 50;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

module.exports = APIFeatures;
