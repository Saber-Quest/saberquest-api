interface ScoreImprovement {
    id: number;
    timeset: string;
    score: number;
    accuracy: number;
    pp: number;
    bonusPp: number;
    rank: number;
    accRight: number;
    accLeft: number;
    averageRankedAccuracy: number;
    totalPp: number;
    totalRank: number;
    badCuts: number;
    missedNotes: number;
    bombCuts: number;
    wallsHit: number;
    pauses: number;
    modifiers: string;
}

interface ContextExtension {
    id: number;
    playerId: string;
    weight: number;
    rank: number;
    baseScore: number;
    modifiedScore: number;
    accuracy: number;
    pp: number;
    passPP: number;
    accPP: number;
    techPP: number;
    bonusPp: number;
    modifiers: string;
    context: number;
    scoreImprovement: ScoreImprovement;
}

interface Song {
    id: string;
    hash: string;
    name: string;
    subName: string;
    author: string;
    mapper: string;
    mapperId: number;
    collaboratorIds: number[] | null;
    coverImage: string;
    bpm: number;
    duration: number;
    fullCoverImage: string;
    explicity: number;
}

interface Difficulty {
    id: number;
    value: number;
    mode: number;
    difficultyName: string;
    modeName: string;
    status: number;
    modifierValues: any;
    modifiersRating: any;
    nominatedTime: number;
    qualifiedTime: number;
    rankedTime: number;
    speedTags: number;
    styleTags: number;
    featureTags: number;
    stars: number;
    predictedAcc: number;
    passRating: number;
    accRating: number;
    techRating: number;
    type: number;
    njs: number;
    nps: number;
    notes: number;
    bombs: number;
    walls: number;
    maxScore: number;
    duration: number;
    requirements: number;
}

interface Leaderboard {
    id: string;
    song: Song;
    difficulty: Difficulty;
}

interface ProfileSettings {
    id: number;
    bio: string | null;
    message: string | null;
    effectName: string;
    profileAppearance: string;
    hue: number;
    saturation: number;
    leftSaberColor: string | null;
    rightSaberColor: string | null;
    profileCover: string;
    starredFriends: string;
    horizontalRichBio: boolean;
    rankedMapperSort: string;
    showBots: boolean;
    showAllRatings: boolean;
    showExplicitCovers: boolean;
    showStatsPublic: boolean;
    showStatsPublicPinned: boolean;
}

interface Clan {
    [key: string]: any;
}

interface Player {
    id: string;
    name: string;
    platform: string;
    avatar: string;
    country: string;
    alias: string;
    bot: boolean;
    pp: number;
    rank: number;
    countryRank: number;
    role: string;
    socials: any;
    contextExtensions: any;
    patreonFeatures: any;
    profileSettings: ProfileSettings;
    clanOrder: string;
    clans: Clan[];
}

interface Offsets {
    id: number;
    frames: number;
    notes: number;
    walls: number;
    heights: number;
    pauses: number;
    saberOffsets: number;
    customData: number;
}

export interface BLResponse {
    contextExtensions: ContextExtension[];
    myScore: any;
    validContexts: number;
    leaderboard: Leaderboard;
    accLeft: number;
    accRight: number;
    id: number;
    baseScore: number;
    modifiedScore: number;
    accuracy: number;
    playerId: string;
    pp: number;
    bonusPp: number;
    passPP: number;
    accPP: number;
    techPP: number;
    rank: number;
    responseRank: number;
    country: string;
    fcAccuracy: number;
    fcPp: number;
    weight: number;
    replay: string;
    modifiers: string;
    badCuts: number;
    missedNotes: number;
    bombCuts: number;
    wallsHit: number;
    pauses: number;
    fullCombo: boolean;
    platform: string;
    maxCombo: number;
    maxStreak: number;
    hmd: number;
    controller: number;
    leaderboardId: string;
    timeset: string;
    timepost: number;
    replaysWatched: number;
    playCount: number;
    lastTryTime: number;
    priority: number;
    originalId: number;
    player: Player;
    scoreImprovement: ScoreImprovement;
    rankVoting: any;
    metadata: any;
    offsets: Offsets;
}

interface LeaderboardPlayerInfo {
    id: string;
    name: string;
    profilePicture: string;
    country: string;
    permissions: number;
    badges: any;
    role: any;
}

interface ScoreData {
    id: number;
    leaderboardPlayerInfo: LeaderboardPlayerInfo;
    rank: number;
    baseScore: number;
    modifiedScore: number;
    pp: number;
    weight: number;
    modifiers: string;
    multiplier: number;
    badCuts: number;
    missedNotes: number;
    maxCombo: number;
    fullCombo: boolean;
    hmd: number;
    timeSet: string;
    hasReplay: boolean;
    deviceHmd: string;
    deviceControllerLeft: string;
    deviceControllerRight: string;
}

interface DifficultyInfo {
    [key: string]: any;
}

interface LeaderboardData {
    id: number;
    songHash: string;
    songName: string;
    songSubName: string;
    songAuthorName: string;
    levelAuthorName: string;
    difficulty: DifficultyInfo;
    maxScore: number;
    createdDate: string;
    rankedDate: string | null;
    qualifiedDate: string | null;
    lovedDate: string | null;
    ranked: boolean;
    qualified: boolean;
    loved: boolean;
    maxPP: number;
    stars: number;
    plays: number;
    dailyPlays: number;
    positiveModifiers: boolean;
    playerScore: any;
    coverImage: string;
    difficulties: any;
}

export interface CommandData {
    score: ScoreData;
    leaderboard: LeaderboardData;
}

export interface SSResponse {
    commandName: string;
    commandData: CommandData;
}
