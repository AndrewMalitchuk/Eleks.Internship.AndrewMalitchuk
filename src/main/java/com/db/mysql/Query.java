package com.db.mysql;

public class Query {

	private String query;
	private String[] values;

	public Query(String queryVal,  String... valuesStr) {
	        query = queryVal;
	        values = valuesStr;
	       
	    }



	public String toString() {
		String queryForExec = query;
		int valuesCount = 0;
		for (char sym : queryForExec.toCharArray()) {
			if (sym == '#') {
				valuesCount++;
			}
		}
		if (valuesCount != values.length) {
			System.out.println("#Error: !=");
			return null;
		}
		for (String strVal : values) {
			queryForExec = queryForExec.replaceFirst("#", strVal);
		}
		return queryForExec;
	}

}
