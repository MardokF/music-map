import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  popupContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupScroll: {
    maxHeight: 250,
  },
  songItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
   bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  songList: {
    maxHeight: 750,
  },
  profileButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    color: '#333',
  },
  songArtist: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  songVotes: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  removeVoteButton: {
    backgroundColor: 'gray',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addSongContainer: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  addSongTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  addSongButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addSongText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchPopup: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  closeButton: {
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noSongsText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#777',
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    elevation: 5,
    padding: 10,
    maxHeight: 200,
    zIndex: 15,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
    voteButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  voteButton: {
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  voteText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emojiText: {
    fontSize: 24, // Grandezza dell'emoji
  },
  happy: {
    backgroundColor: '#A5D6A7'
  },
  happyActive: {
    backgroundColor: '#4CAF50'
  },
  sad: {
    backgroundColor: '#EF9A9A'
  },
  sadActive: {
    backgroundColor: '#F44336'
  },
  adrenalin: {
    backgroundColor: '#FFCC80'
  },
  adrenalinActive: {
    backgroundColor: '#FF9800'
  },
  relaxed: {
    backgroundColor: '#90CAF9'
  },
  relaxedActive: {
    backgroundColor: '#2196F3'
  },
  reactionSummary: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},
reactionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  borderRadius: 50,
  paddingVertical: 4,
  paddingHorizontal: 8,
},
reactionIconsContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 8,
},
reactionIcon: {
  width: 24,
  height: 24,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#ddd',
  zIndex: 1,
},
reactionIconFirst: {
  marginLeft: 0,
  zIndex: 5,
},
reactionIconInner: {
  fontSize: 14,
},
reactionCountText: {
  fontSize: 14,
  fontWeight: 'bold'
},
reactionIconOverlap: {
  marginLeft: -8,
  zIndex: 20,
},
});


export default styles;
