import Team from '../models/Team.js'

export const createTeam = async (req, res) => {
    try {
        const { teamName, players } = req.body;

        if(!teamName) {
            return res.status(400).json({ message: 'Team Name required' })
        }

        const existTeam = await Team.findOne({ teamName, createdBy: req.user._id });

        if(existTeam) {
            return res.status(400).json({ message: 'Team Name is already Exist'})
        }
        
        const playersName = players.map(p => p.name);

        const existPlayer = await Team.findOne({
            createdBy: req.user._id,
            'players.name': { $in: playersName}
        });

        if(existPlayer) {

            const matchedPlayert = existPlayer.players.find((p => playersName.includes(p.name)))

            return res.status(400).json({ message: `${matchedPlayert.name}, Already Exists in team: ${existPlayer.teamName}` })
        }

        const team = await Team.create({
            teamName,
            players,
            createdBy: req.user._id 
        })

        res.status(200).json({
            success: true,
            message: 'A Team has been created successfully',
            data: team
        })
    } catch (error) {
        console.error("Create Team Error: ", error);
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getTeam = async (req, res) => {
    try {
        const allTeam = await Team.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json(
            {
                success: true,
                message: 'Fetching Team success',
                data: allTeam
            }
        )
    } catch (error) {
        console.error("Fetch Team: ", error);
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getOneTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const oneTeam = await Team.findOne({ _id: id,  createdBy: req.user._id });

        if(!oneTeam) {
            return res.status(400).json({ success: false , message: 'Team not found' })
        }

        return res.status(200).json({ success: true, message: `${oneTeam.teamName} Team selected` , data: oneTeam})
    } catch (error) {
        console.error("Error Selecting a Team", error);
        res.status(500).json({ success: false, message: error.message })
    }
}

export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamName, players } = req.body;

        if(!teamName) {
            return res.status(400).json({ message: 'Team Name required' })
        }
        
        const updateTeam = await Team.findByIdAndUpdate(
            { _id: id, createdBy: req.user._id },
            { teamName, players },
            { new: true}
        )

        res.status(200).json({ success: false, message: 'Team Updated', data: updateTeam });

    } catch (error) {
        console.error("Update Team Error: ", error);
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        
        const delTeam = await Team.findByIdAndDelete(id);

        if(!delTeam){
            return res.status(400).json({ success: false , message: 'Team not found' })
        }

        res.status(200).json({ success: false, message: 'Team Deleted', data: delTeam });
    } catch (error) {
        console.error("Delete Team Error: ", error);
        res.status(500).json({ success: false, message: error.message })
    }
}