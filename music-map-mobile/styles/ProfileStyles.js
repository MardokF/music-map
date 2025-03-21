import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
logoutButton: {
  position: 'absolute',
  top: 20,
  right: 20,
  zIndex: 10,
},

profileHeader: {
  marginTop: 60, // spazio sotto l’icona
  paddingHorizontal: 16,
  marginBottom: 10,
},
topBar: {
  marginTop: 20,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

profileTitle: {
  fontSize: 18,
  fontWeight: 'bold',
},
  container: { 
	  flex: 1,
	  padding: 20, 
	  backgroundColor: '#fff' 
  },
  title: { 
	  fontSize: 20, 
	  fontWeight: 'bold', 
	  marginBottom: 10 
  },
  songItem: 
  { padding: 15, 
  backgroundColor: '#ddd', 
  marginBottom: 10, 
  borderRadius: 5 
  },
  deleteButton: 
  { color: 'red', 
  fontWeight: 'bold' 
  },

});


export default styles;
