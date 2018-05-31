let $main = document.getElementsByClassName("main")[0];
let $clear = document.getElementsByTagName("button")[0];

$clear.addEventListener("click", function clearDownloads(){
	browser.downloads.erase({ state : "complete" }).then( () => { $main.innerHTML = '' });
});
browser.downloads.search({ "orderBy" : ["-startTime"], "state" : "complete" })
	.then( items => Promise.all(items.map(i =>
			browser.downloads.getFileIcon(i.id).then( url => { i.icon = url; return i })
		))
	)
	.then( items => items.map( i => {
		return {
			icon : i.icon,
			exists : i.exists,
			time : i.startTime,
			id : i.id,
			state : i.state,
			url : i.url,
			size : i.fileSize,
			name : i.filename
		}
	}))
	.then( items => items.map(render) )
	.then( items => items.forEach( i => { $main.appendChild(i) }));

function fileName( str ){ return str.slice(str.lastIndexOf("\\")+1); }
function dayjs(date){ return new Date(date).toLocaleString("en-GB"); }
function origin(url){ return new URL(url).hostname; }
function show(id){ browser.downloads.show(id); }
function erase(id){ browser.downloads.erase({ id : id }).then( () => document.querySelector(".item-" + id).remove() ); }

function render( i ){
	let $item = document.createElement('li');
		$item.className = "item item-" + i.id;

	let $icon = document.createElement("div");
		$icon.className = "item__icon";

	let $iconImg = document.createElement("img");
		$iconImg.src = i.icon;

	let $desc = document.createElement("div");
		$desc.className = "item__desc";

	let $title = document.createElement("div");
		$title.className = "item__desc__title";

	let $titleLink = document.createElement("a");
		$titleLink.textContent = fileName(i.name);

	let $status = document.createElement("span");
		$status.className = "item__desc__status";

	if( i.exists ){
		$status.className += " item__desc__status--success";
		$status.textContent = i.size + " bytes";
	}else{
		$status.className += " item__desc__status--warning";
		$status.textContent = "File moved or missing";
	}

	let $metadata = document.createElement("div");
		$metadata.className = "item__desc__metadata";

	let $origin = document.createElement('a');
		$origin.textContent = origin(i.url);
		$origin.href = i.url;

	let $action = document.createElement("div");
		$action.className = "item__action";

	let $erase = document.createElementNS("http://www.w3.org/2000/svg","svg");
		$erase.setAttribute("width", 16);
		$erase.setAttribute("height", 16);
		$erase.setAttribute("viewBox", "0 0 16 16");
		$erase.addEventListener('click', erase.bind(null, parseInt(i.id, 10)) );
	let $eraseUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
		$eraseUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#delete");

	let $open;
	if( i.exists ){
		$open = document.createElementNS("http://www.w3.org/2000/svg","svg");
		$open.setAttribute("width", 16);
		$open.setAttribute("height", 16);
		$open.setAttribute("viewBox", "0 0 16 16");
		$open.addEventListener('click', show.bind(null, parseInt(i.id, 10)) );

		let $openUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
			$openUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#folder");

		$open.appendChild($openUse);
	}

	$erase.appendChild($eraseUse);

	$icon.appendChild($iconImg);

	$title.appendChild($titleLink);
	$title.appendChild($status);
	$desc.appendChild($title);

	$metadata.appendChild($origin);
	$desc.appendChild($metadata);

	$action.appendChild($erase);
	if( i.exists ){ $action.appendChild($open); }

	$item.appendChild($icon);
	$item.appendChild($desc);
	$item.appendChild($action);

	return $item;
}