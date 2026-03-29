#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

#[contract]
pub struct VoteContract;

#[contractimpl]
impl VoteContract {
    /// Cast a vote for a specific option. 
    /// Requires authorization from the voter.
    pub fn vote(env: Env, voter: Address, option: Symbol) {
        voter.require_auth();

        // Check if the voter has already voted
        let voter_key = (symbol_short!("voter"), voter.clone());
        if env.storage().persistent().has(&voter_key) {
           panic!("You have already voted");
        }

        // Increment the vote count for the chosen option
        let current_votes: u32 = env.storage().persistent().get(&option).unwrap_or(0);
        env.storage().persistent().set(&option, &(current_votes + 1));

        // Mark this voter as having voted to prevent double voting
        env.storage().persistent().set(&voter_key, &true);
    }

    /// Retrieve the current vote count for a specific option.
    pub fn get_votes(env: Env, option: Symbol) -> u32 {
        env.storage().persistent().get(&option).unwrap_or(0)
    }

    /// Optional: Reset voting status (for testing purposes or controlled environments)
    pub fn reset_voter(env: Env, voter: Address) {
        let voter_key = (symbol_short!("voter"), voter);
        env.storage().persistent().remove(&voter_key);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_voting() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VoteContract);
        let client = VoteContractClient::new(&env, &contract_id);

        let voter1 = Address::generate(&env);
        let voter2 = Address::generate(&env);
        let option_a = symbol_short!("A");
        let option_b = symbol_short!("B");

        // First vote
        env.mock_all_auths();
        client.vote(&voter1, &option_a);
        assert_eq!(client.get_votes(&option_a), 1);

        // Second vote (different voter)
        client.vote(&voter2, &option_a);
        assert_eq!(client.get_votes(&option_a), 2);

        // Vote for different option
        let voter3 = Address::generate(&env);
        client.vote(&voter3, &option_b);
        assert_eq!(client.get_votes(&option_b), 1);
    }

    #[test]
    #[should_panic(expected = "You have already voted")]
    fn test_double_voting() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VoteContract);
        let client = VoteContractClient::new(&env, &contract_id);

        let voter = Address::generate(&env);
        let option = symbol_short!("A");

        env.mock_all_auths();
        client.vote(&voter, &option);
        client.vote(&voter, &option); // Should panic
    }
}
