import DVector3 from "../../../components/graphics3d/pub/DVector3";

export interface IPlayerInfo {
    id: string;
    spawnLocation: DVector3;
}

export default function getPlayers(): IPlayerInfo[] {
    return [
        {
            id: "player-1",
            spawnLocation: {x: 4, y: 6, z: -7}
        },
        {
            id: "player-2",
            spawnLocation: {x: 0, y: 6, z: -7}
        }
    ];
}