# 7-3 Project Two Submission
# Southern New Hampshire University
# IT-140: Introduction to Scripting
# Decker, Christopher (M.S)
# Duane Wegner
# February 20, 2024

# I made a few changes to my scenario from module 5 for the game just to make the gameplay a little more fluid.
# They are as follows.

# The theme revolves around a struggle between light and darkness within the enchanted forest named Whispering Woods.
# The storyline follows the player, an adventurer named Sprout, tasked with restoring balance to the forest after it
# falls under the shadowy grasp of Darkroot, an evil treant corrupted by a dark magic wielding druid. As the player
# navigates through the Whispering Grove, Dusky Hollow, Hidden Vale, Murky Path, Moonlight Clearing, Ancient Tree,
# Enchanted Grove, and Shadow Hollow, they must gather items of power to aid them in their journey to save the forest.
# These items include a silver axe to cut through Darkroot’s bark, a sunlight elixir to lower Darkroot's defenses, an
# ancient rune to provide light in darkroot's demise, a barkskin potion for protection, a druidic staff for channeling
# nature's fire energy to slay Darkroot, and a cloak to provide camouflage in the battle against Darkroot bolstering
# defense. The goal is to confront Darkroot and restore balance to evil and good in the once vibrant forest of the
# Whispering Woods.

# Function to display game instructions.
def show_instructions():
    # Display welcome message instructing the player of the game instructions.
    print("______________________________________________________________________________________________________")
    print("Welcome to the Whispering Woods a text based adventure game.")
    print("              _____________________________________________________________________________")
    print("You find yourself a new inspiring hero name Sprout surrounded by the forest elders, they tell you of a \n  "
          "dark evil lurking in the forest, a Treant named Darkroot. They tell you of a quest to gather six items \n  "
          "of power in order to succeed in the battle against the evil Darkroot to save the forest.")
    print("Collect all six items of power and face Darkroot to win the game, or be defeated by Darkroot.")
    print("To move Sprout to a new room type a command: North, South, East, West")
    print("To add items to Sprout's backpack type: get (item name)")
    print("______________________________________________________________________________________________________")


# Function to display player's current status and inventory.
def show_status(room, inventory, current_item):
    # Display current room, inventory, and presence of an item of power if one exists.
    print("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    print("Sprout finds himself in the", room)
    print("Backpack:", inventory)
    print("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

    # Check if the player is in the Moonlight Clearing and doesn't have all six items of power.
    if room == "Moonlight Clearing" and len(inventory) < 6:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("You hear a loud BOOM, BOOM, BOOM, coming from the north. Do you Dare continue?")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

    # An item of power is currently in the room.
    if current_item:
        print("An item of power glows in your presence, a " + current_item + ", do you dare approach it?")
    # No item of power is in the room.
    else:
        print("Sprout looks around, but, can't seem to see an item of power. He asks you: What should I do next?")
    print("______________________________________________________________________________________________________")


# Main function where the game resides.
def main():
    # Dictionary containing room details (for exit direction) and items of power.
    rooms = {
        "Whispering Grove": {'North': "Murky Path", 'East': "Moonlight Clearing", 'West': 'Dusky Hollow',
                             'South': "Ancient Tree", 'Item': None},
        "Dusky Hollow": {'East': 'Whispering Grove', 'Item': 'Silver Axe'},
        "Hidden Vale": {'West': 'Murky Path', 'Item': 'Sunlight Elixir'},
        "Murky Path": {'East': 'Hidden Vale', 'South': 'Whispering Grove', 'Item': 'Cloak'},
        "Moonlight Clearing": {'West': "Whispering Grove", 'North': 'Shadow Hollow', 'Item': 'Druidic Staff'},
        "Ancient Tree": {'North': 'Whispering Grove', 'East': 'Enchanted Grove', 'Item': 'Barkskin Potion'},
        "Enchanted Grove": {'West': 'Ancient Tree', 'Item': 'Ancient Rune'},
        "Shadow Hollow": {'South': 'Moonlight Clearing', 'Item': None}
    }

    # Starting room and empty inventory setup.
    current_room = "Whispering Grove"
    inventory = []

    while True:
        # Display current status (room and inventory)
        show_status(current_room, inventory, rooms[current_room]['Item'])

        # Extract available exits for the current room from rooms dictionary.
        available_exits = [exit_direction for exit_direction in rooms[current_room].keys() if exit_direction != 'Item']
        print("Available directions for Sprout to exit the current location he finds himself in are:", ", "
              .join(available_exits))
        print("                                    ----------------------------                                       ")

        # Get input from the user.
        command = (input("Enter a command for Sprout to follow, i.e. (A direction to travel) or, get (item name): ")
                   .capitalize())

        # Check if users' input is a valid response.
        if command in available_exits:
            # Move to the next room
            current_room = rooms[current_room][command]
            # Check if the player entered Shadow Hollow to know how to end the game.
            if current_room == 'Shadow Hollow':
                # Check if the player has all six items of power to defeat the evil treant Darkroot.
                if len(inventory) == 6:
                    # Player wins the game when they have all six items of power and face Darkroot.
                    print("________________________________________________________________________________________\n  "
                          "You see the evil treant Darkroot with the little time you have you pull all the items \n  "
                          "from your back pack. You drink the Barkskin potion and thrown the sunlight elixir \n  "
                          "at Darkroot lowering his defenses equip the axe and the cloak gaining the defense needed "
                          "to overcome Darkroot's attacks. But, as the battle proceeds Darkroot learns your\n   "
                          "strategy,you switch it up to the staff burning away at Darkroot, using the Ancient Rune\n  "
                          "to light your way in the darkness of the smoke from his burning body. In one final \n  "
                          "sweep of the Druidic Staff you fell Darkroot Saving the Whispering Woods. You have\n  "
                          "defeated the evil treant Darkroot and saved the Whispering Woods! The elders gather\n  "
                          "around you praising you with thanks naming you the new guardian of the Whispering Woods!\n  "
                          "________________________________________________________________________________________\n  "
                          "Congratulations on saving the Whispering Woods! .....This time.....\n  "
                          "________________________________________________________________________________________\n  "
                          ".... The Elders begin to whisper of the threat of a Druid named Black Branch and how he \n  "
                          "was connected to Darkroot.\n  "
                          "..... TO BE CONTINUED....")
                    # Ask the player if they want to play again.
                    play_again = input("Would you like to play again? (yes/no): ").lower()
                    if play_again == "yes":
                        # Reset the game if the player wants to play again.
                        current_room = "Whispering Grove"
                        inventory = []
                    else:
                        # End the game if the player does not want to play again.
                        print("Thanks for playing! The Whispering Woods thanks you for being the guardian that \n  "
                              "stepped up to save the forest. The Elders may call upon you another day.")
                        break
                else:
                    # Player loses the game as they entered Shadow Hollow without all six items of power.
                    print("You entered Shadow Hollow without all six items of power, the evil treant Darkroot \n  "
                          "charges towards you swinging with all his might, Darkroot, throws everything at you, he\n  "
                          " has overpowered you and won this time, come back better prepared next time. The Elders\n  "
                          "have words of wisdom for Sprout. The Elders suggest that you try and find all six items\n  "
                          "of power before you try to take on Darkroot again, they used a large amount of their \n  "
                          "power to bring you back to try to save the forest this time, but, you may not be as\n  "
                          "lucky next time.")
                    # Ask the player if they want to play again.
                    play_again = input("Would you like to play again? (yes/no): ").lower()
                    if play_again == "yes":
                        # Reset the game if the player wants to play again.
                        current_room = "Whispering Grove"
                        inventory = []
                    else:
                        # End the game if the player does not want to play again.
                        print("Thank you for playing, come back soon the Whispering Woods needs your help!")
                        break
        # Check if the users' input is a command for picking up an item of power.
        elif command.startswith("Get "):
            # Extract the item of power's name from the command.
            item_name = ' '.join(command.split()[1:]).capitalize()
            # Check if the item of power exists in the current room.
            if ('Item' in rooms[current_room] and rooms[current_room]['Item'] and rooms[current_room]['Item'].lower()
                    == item_name.lower()):
                # Add the item to the player's backpack.
                print("     **********     ")
                print("You received the item of power and placed it in your backpack:", item_name)
                print("     **********     ")
                inventory.append(item_name)
                rooms[current_room]['Item'] = None
            else:
                # Notify the player if the item they input does not exist in the current room.
                print("**********************************")
                print("No such item exists in this room. Sprout looks around and asks are you sure such an item \n  "
                      "exists this room, asking you what he should do next.")
                print("**********************************")
        else:
            # Notify the player if their input is invalid.
            print("                           !!!!!!                                  ")
            print("Invalid command. Please enter a valid command for Sprout to follow.")
            print("                           !!!!!!                                  ")


# Entry point to start the program.
if __name__ == "__main__":
    # Display game instructions.
    show_instructions()
    # Start the game.
    main()
