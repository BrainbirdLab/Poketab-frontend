export const avList = [
	'Mankey', 
	'Meowth', 
	'Mew', 
	'Squirtle', 
	'Charmander', 
	'Psyduck', 
	'Caterpie', 
	'Eevee', 
	'Haunter', 
	'Mewtwo', 
	'Jigglypuff', 
	'Pichu', 
	'Pidgey', 
	'Pikachu', 
	'Dratini', 
	'Raichu', 
	'Zubat', 
	'Articuno', 
	'Bellsprout', 
	'Blastoise', 
	'Bulbasaur', 
	'Charizard', 
	'Rattata', 
	'Rayquaza', 
	'Snorlax', 
	'Ivysaur', 
	'Palkia'
];


export const isRealString = (str: string) => {
	return typeof str === 'string' && str.trim().length > 0;
};

export function validateUserName(username: string){
	const name_format = /^[a-zA-Z0-9_\u0980-\u09FF]{3,20}$/;
	return ( isRealString(username) && name_format.test(username) && username.trim().length > 0);
}

export function validatepokemon(pokemon: string){
	return avList.includes(pokemon);
}

export function validateKey(key: string){
	const keyformat = /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/;
	return keyformat.test(key);
}

export function validateAll(username: string, key: string, pokemon: string){
	return (validateUserName(username) && validateKey(key) && validatepokemon(pokemon));
}