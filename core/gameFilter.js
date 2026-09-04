/**
 * GameFilter - Multi-tag categorization, search, and sorting utility for LuckyKit games.
 */
export const GAME_CATEGORIES = {
    ALL: 'all',
    ACTION: 'action',
    PUZZLE: 'puzzle',
    BOARD: 'board',
    RETRO: 'retro',
    CARDS: 'cards'
};

export const GAME_METADATA = [
    { id: 'snake', name: 'Cyber Snake', category: 'retro', difficulty: 'easy', tags: ['arcade', 'classic'] },
    { id: '2048', name: '2048 Cyber', category: 'puzzle', difficulty: 'medium', tags: ['numbers', 'puzzle'] },
    { id: 'chess', name: 'Neo Chess', category: 'board', difficulty: 'hard', tags: ['strategy', 'multiplayer'] },
    { id: 'checkers', name: 'Cyber Checkers', category: 'board', difficulty: 'medium', tags: ['strategy'] },
    { id: 'connect4', name: 'Connect 4 Neon', category: 'board', difficulty: 'easy', tags: ['strategy'] },
    { id: 'dino', name: 'T-Rex Runner', category: 'action', difficulty: 'easy', tags: ['endless', 'reflexes'] },
    { id: 'escape', name: 'Escape Monster', category: 'action', difficulty: 'hard', tags: ['runner', 'intense'] },
    { id: 'brick', name: 'Brick Breaker', category: 'retro', difficulty: 'medium', tags: ['arcade', 'classic'] },
    { id: 'sudoku', name: 'Neon Sudoku', category: 'puzzle', difficulty: 'hard', tags: ['logic', 'numbers'] },
    { id: 'uno', name: 'Cyber Uno', category: 'cards', difficulty: 'easy', tags: ['cards', 'multiplayer'] },
    { id: 'ludo', name: 'Neon Ludo', category: 'board', difficulty: 'easy', tags: ['multiplayer', 'family'] },
    { id: 'rps', name: 'Rock Paper Scissors', category: 'casual', difficulty: 'easy', tags: ['quick', 'luck'] }
];

class GameFilter {
    filterByCategory(category = 'all', games = GAME_METADATA) {
        if (!category || category === 'all') return games;
        return games.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }

    searchGames(query = '', games = GAME_METADATA) {
        if (!query || !query.trim()) return games;
        const q = query.toLowerCase().trim();
        return games.filter(g => 
            g.name.toLowerCase().includes(q) ||
            g.category.toLowerCase().includes(q) ||
            (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
        );
    }

    sortBy(criteria = 'name', games = GAME_METADATA, ascending = true) {
        const sorted = [...games];
        sorted.sort((a, b) => {
            let valA = a[criteria] || '';
            let valB = b[criteria] || '';
            if (typeof valA === 'string') {
                return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return ascending ? valA - valB : valB - valA;
        });
        return sorted;
    }
}

export const gameFilter = new GameFilter();
