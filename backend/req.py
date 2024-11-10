# Function to read and process the file
def remove_lines_with_at(input_file, output_file):
    with open(input_file, 'r') as infile:
        lines = infile.readlines()  # Read all lines from the file

    # Filter out lines that contain '@'
    lines_to_write = [line for line in lines if '@' not in line]

    # Write the filtered lines back to the output file
    with open(output_file, 'w') as outfile:
        outfile.writelines(lines_to_write)

# Usage example
input_file = 'requirements.txt'  # Path to the input text file
output_file = 'output.txt'  # Path to the output text file

remove_lines_with_at(input_file, output_file)
