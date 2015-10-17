import './actions';
import {setServices} from './Stores/Services';

export default function setup(services) {
  setServices(services);
}
