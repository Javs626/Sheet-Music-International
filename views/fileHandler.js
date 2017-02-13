/*
function File(props) {
	return (
		<li className="list-group-item">
			<h4>{props}</h4>
		</li>
	);
}

function FileList(props) {
	return (
		<ul className="list-group">
			{props}
		</ul>
	);
}

class App extends React.Component {
	constructor() {
		super();

		this.state = {
			files: []
		};
	}

	componentWillMount() {
		fetch('/fileDisplay')
			.then(res => res.json())
			.then(data => {
				this.setState({  files: data });
			})
	}

	render() {
		return (
			<div>
				<FileList files={this.state.files} />
			</div>
		);
	}
}
*/
ReactDOM.render(
	<App />,
	document.getElementById('example')
);
